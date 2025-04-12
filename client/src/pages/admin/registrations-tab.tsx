import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Registration } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RegistrationsTab() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["/api/registrations"],
  });

  const updateRegistrationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/registrations/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration updated",
        description: "The registration status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating registration",
        description: error.message || "There was a problem updating the registration.",
        variant: "destructive",
      });
    },
  });

  const deleteRegistrationMutation = useMutation({
    mutationFn: async (registrationId: number) => {
      await apiRequest("DELETE", `/api/registrations/${registrationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Registration deleted",
        description: "The registration has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedRegistration(null);
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting registration",
        description: error.message || "There was a problem deleting the registration.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateRegistrationMutation.mutate({ id, status });
  };

  const handleDeleteClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedRegistration) {
      deleteRegistrationMutation.mutate(selectedRegistration.id);
    }
  };

  // Filter registrations based on search query and status filter
  const filteredRegistrations = registrations?.filter((registration: Registration) => {
    const matchesSearch = 
      searchQuery === "" ||
      registration.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      registration.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      registration.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      registration.registrationId.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || registration.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get registration counts by status
  const countByStatus = {
    total: registrations?.length || 0,
    confirmed: registrations?.filter(r => r.status === "confirmed").length || 0,
    pending: registrations?.filter(r => r.status === "pending").length || 0,
    cancelled: registrations?.filter(r => r.status === "cancelled").length || 0
  };

  const columns: ColumnDef<Registration>[] = [
    {
      accessorKey: "registrationId",
      header: "ID",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.registrationId}</span>,
    },
    {
      accessorKey: "name",
      header: "Participant",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.firstName} {row.original.lastName}</div>
          <div className="text-xs text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "participantType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.participantType}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge 
            variant={
              status === "confirmed" ? "success" : 
              status === "pending" ? "warning" : 
              "destructive"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const registration = row.original;
        return (
          <div className="flex justify-end space-x-2">
            {registration.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600"
                onClick={() => handleStatusChange(registration.id, "confirmed")}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {registration.status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={() => handleStatusChange(registration.id, "cancelled")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(registration)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Registration Management</h2>
        <Button className="flex items-center gap-1">
          <UserPlus className="h-4 w-4 mr-1" />
          Add Registration
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading registrations...</span>
        </div>
      ) : (
        <>
          {registrations?.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700">
                  You have <span className="font-medium">{countByStatus.pending}</span> new registrations pending review.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary-600">{countByStatus.total}</div>
                <div className="text-sm text-gray-500">Total Registrations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{countByStatus.confirmed}</div>
                <div className="text-sm text-gray-500">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">{countByStatus.pending}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{countByStatus.cancelled}</div>
                <div className="text-sm text-gray-500">Cancelled</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between mb-4 flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search registrations..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable 
            columns={columns} 
            data={filteredRegistrations || []} 
            isLoading={isLoading}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the registration for {selectedRegistration?.firstName} {selectedRegistration?.lastName}? This action cannot be undone.
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
              disabled={deleteRegistrationMutation.isPending}
            >
              {deleteRegistrationMutation.isPending ? (
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

// We need to import this separately because it wasn't imported at the top
import { Trash2 } from "lucide-react";
