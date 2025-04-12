import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WikiContent, insertWikiContentSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileText, Plus, Edit, Trash2 } from "lucide-react";

export default function ContentTab() {
  const { toast } = useToast();
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<WikiContent | null>(null);
  const [newCategory, setNewCategory] = useState("");

  const { data: wikiContents, isLoading: contentsLoading } = useQuery({
    queryKey: ["/api/wiki"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/wiki/categories"],
  });

  const form = useForm<z.infer<typeof insertWikiContentSchema>>({
    resolver: zodResolver(insertWikiContentSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      createdBy: 1, // Default to current user, will be overridden server-side
    },
  });

  const createWikiMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertWikiContentSchema>) => {
      const res = await apiRequest("POST", "/api/wiki", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Content created",
        description: "The wiki content has been created successfully.",
      });
      setIsAddingContent(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/wiki"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wiki/categories"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating content",
        description: error.message || "There was a problem creating the content.",
        variant: "destructive",
      });
    },
  });

  const updateWikiMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<z.infer<typeof insertWikiContentSchema>> }) => {
      const res = await apiRequest("PUT", `/api/wiki/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Content updated",
        description: "The wiki content has been updated successfully.",
      });
      setIsAddingContent(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/wiki"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wiki/categories"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating content",
        description: error.message || "There was a problem updating the content.",
        variant: "destructive",
      });
    },
  });

  const deleteWikiMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/wiki/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Content deleted",
        description: "The wiki content has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedContent(null);
      queryClient.invalidateQueries({ queryKey: ["/api/wiki"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wiki/categories"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting content",
        description: error.message || "There was a problem deleting the content.",
        variant: "destructive",
      });
    },
  });

  const handleAddContentClick = () => {
    form.reset({
      title: "",
      content: "",
      category: "",
      createdBy: 1,
    });
    setSelectedContent(null);
    setIsAddingContent(true);
  };

  const handleEditContent = (content: WikiContent) => {
    form.reset({
      title: content.title,
      content: content.content,
      category: content.category,
      createdBy: content.createdBy,
    });
    setSelectedContent(content);
    setIsAddingContent(true);
  };

  const handleDeleteClick = (content: WikiContent) => {
    setSelectedContent(content);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: z.infer<typeof insertWikiContentSchema>) => {
    if (selectedContent) {
      updateWikiMutation.mutate({ id: selectedContent.id, data });
    } else {
      createWikiMutation.mutate(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedContent) {
      deleteWikiMutation.mutate(selectedContent.id);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // We'll add a new content with minimal data to effectively create the category
    createWikiMutation.mutate({
      title: `${newCategory} Introduction`,
      content: `<p>Introduction to ${newCategory}</p>`,
      category: newCategory,
      createdBy: 1,
    });
    
    setNewCategory("");
    setIsAddingCategory(false);
  };

  const isLoading = contentsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading content...</span>
      </div>
    );
  }

  // Group content by last updated date (today, this week, older)
  const groupedContent: Record<string, WikiContent[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

  wikiContents?.forEach((content: WikiContent) => {
    const updateDate = new Date(content.lastUpdated).getTime();
    let group = 'Older';
    
    if (updateDate >= today) {
      group = 'Today';
    } else if (updateDate >= weekAgo) {
      group = 'This Week';
    }
    
    if (!groupedContent[group]) {
      groupedContent[group] = [];
    }
    
    groupedContent[group].push(content);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Content Management</h2>
        <div>
          <Button onClick={handleAddContentClick} className="flex items-center gap-1">
            <Plus className="h-4 w-4 mr-1" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {Object.entries(groupedContent).map(([group, contents]) => (
          contents.slice(0, 1).map((content) => (
            <Card key={content.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 p-4 border-b flex flex-row justify-between items-center">
                <CardTitle className="text-base font-medium">{content.title}</CardTitle>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => handleEditContent(content)}>
                    <Edit className="h-4 w-4 text-primary-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500 mb-2">
                  Last updated: {new Date(content.lastUpdated).toLocaleDateString()}
                </div>
                <div className="text-sm truncate">
                  Category: {content.category}
                </div>
              </CardContent>
            </Card>
          ))
        ))}
      </div>

      {/* Wiki Categories */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Wiki Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {categories?.map((category: string) => (
              <li key={category} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span>{category}</span>
                <div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                    form.setValue("category", category);
                    handleAddContentClick();
                  }}>
                    <Edit className="h-4 w-4 text-primary-600" />
                  </Button>
                  {/* We don't implement delete for categories here as it would require deleting all content in that category */}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddingCategory(true)}
              className="text-sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Content List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {wikiContents?.map((content: WikiContent) => (
              <div key={content.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary-500 mr-3" />
                  <div>
                    <h4 className="font-medium">{content.title}</h4>
                    <p className="text-sm text-gray-500">Category: {content.category}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditContent(content)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteClick(content)}
                    className="h-8 w-8 p-0 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Content Dialog */}
      <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedContent ? "Edit Wiki Content" : "Add Wiki Content"}</DialogTitle>
            <DialogDescription>
              {selectedContent
                ? "Update the content information"
                : "Create new wiki content"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Content title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Physics, Chemistry, Biology" 
                        list="categories"
                        {...field} 
                      />
                    </FormControl>
                    <datalist id="categories">
                      {categories?.map((category: string) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                    <FormDescription>
                      Select an existing category or create a new one
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (HTML)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter HTML content here"
                        className="font-mono h-64 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can use HTML to format the content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingContent(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createWikiMutation.isPending || updateWikiMutation.isPending}
                >
                  {(createWikiMutation.isPending || updateWikiMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    selectedContent ? "Update Content" : "Create Content"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for organizing wiki content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="new-category" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Category Name
              </label>
              <Input
                id="new-category"
                placeholder="e.g., Astronomy"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddingCategory(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={createWikiMutation.isPending}
            >
              {createWikiMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the content "{selectedContent?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteWikiMutation.isPending}
            >
              {deleteWikiMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
