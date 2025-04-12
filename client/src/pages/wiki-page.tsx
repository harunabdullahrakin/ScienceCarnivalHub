import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Loader2, Search } from "lucide-react";
import { WikiContent } from "@shared/schema";

export default function WikiPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/wiki/categories"],
  });

  const { data: wikiContents, isLoading: contentsLoading } = useQuery({
    queryKey: ["/api/wiki"],
  });

  // Filter content based on selected category and search query
  const filteredContent = wikiContents?.filter((content: WikiContent) => {
    const matchesCategory = !selectedCategory || content.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get the first content to display or use selected content
  const selectedContent = filteredContent && filteredContent.length > 0 
    ? filteredContent[0] 
    : null;

  const isLoading = categoriesLoading || contentsLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-montserrat font-bold">Science Wiki</h1>
          <p className="mt-2 text-lg sm:text-xl">Explore science topics and learn something new</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading wiki content...</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-1/4">
              <div className="sticky top-4">
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search wiki..." 
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Categories</h3>
                  <ul className="space-y-2">
                    <li>
                      <button 
                        onClick={() => setSelectedCategory(null)}
                        className={`block ${!selectedCategory ? 'text-primary-600 font-medium' : 'text-gray-600 hover:text-primary-600'} w-full text-left`}
                      >
                        All Categories
                      </button>
                    </li>
                    {categories?.map((category: string) => (
                      <li key={category}>
                        <button 
                          onClick={() => setSelectedCategory(category)}
                          className={`block ${selectedCategory === category ? 'text-primary-600 font-medium' : 'text-gray-600 hover:text-primary-600'} w-full text-left`}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-3/4">
              {selectedContent ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-4 font-montserrat">{selectedContent.title}</h2>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedContent.content }}></div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-4 font-montserrat">No Content Found</h2>
                  <p>Please select a different category or try another search term.</p>
                </div>
              )}

              {filteredContent && filteredContent.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold mb-4">Related Topics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredContent.filter(content => content.id !== selectedContent?.id).slice(0, 4).map((content: WikiContent) => (
                      <button 
                        key={content.id} 
                        onClick={() => {
                          setSelectedCategory(content.category);
                          setSearchQuery(content.title);
                        }}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium">{content.title}</h4>
                          <p className="text-sm text-gray-500">{content.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
