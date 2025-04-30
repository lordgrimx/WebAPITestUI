"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  X, 
  HelpCircle, 
  MessageSquare, 
  Search, 
  FileText, 
  ExternalLink,
  SendHorizontal,
  Info,
  BookOpen,
  Loader2

} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AIChatModal from "./AIChatModal";
import { getFaqs } from "@/lib/api/faq-api";
import { getHelpDocuments } from "@/lib/api/help-api";
import { createTicket } from "@/lib/api/support-api";


function HelpSupportModal({ open, setOpen, darkMode }) {
  const [activeTab, setActiveTab] = useState("faq");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [helpDocuments, setHelpDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();
  
  // Form states
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchFaqs();
      fetchHelpDocuments();
    }
  }, [open]);
  
  const fetchFaqs = async () => {
    if (faqs.length > 0) return; // Don't fetch if we already have data
    
    try {
      setIsLoading(true);
      const data = await getFaqs();
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      // Fallback to hardcoded FAQs if API fails
      setFaqs([
        {
          id: 1,
          question: "How do I create a new API request?",
          answer: "To create a new API request, click on the '+' button in the top left corner of the sidebar and select 'New Request'. You can then specify the request method, URL, and other details.",
          category: "Getting Started"
        },
        {
          id: 2,
          question: "How do I save an API request?",
          answer: "After configuring your API request, click the 'Save' button in the top navigation bar. You can provide a name, description, and select a collection to save it to.",
          category: "Getting Started"
        },
        {
          id: 3,
          question: "How do I share my API requests with team members?",
          answer: "You can share API requests by clicking the 'Share' button in the top navigation bar. You can generate a shareable link or directly share with specific team members if you're on a team plan.",
          category: "Collaboration"
        },
        {
          id: 4,
          question: "How do I set up environment variables?",
          answer: "Click on the 'Environment' dropdown in the top navigation bar. Here you can create new environments and define variables that can be used across your API requests.",
          category: "Environment"
        },
        {
          id: 5,
          question: "How do I run automated tests?",
          answer: "In the request builder, navigate to the 'Tests' tab where you can write JavaScript test scripts that will be executed after your request completes. The results will be displayed in the Test Results panel.",
          category: "Testing"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchHelpDocuments = async () => {
    if (helpDocuments.length > 0) return; // Don't fetch if we already have data
    
    try {
      setIsLoading(true);
      const data = await getHelpDocuments();
      setHelpDocuments(data);
    } catch (error) {
      console.error('Error fetching help documents:', error);
      // Fallback to hardcoded help documents if API fails
      setHelpDocuments([
        {
          id: 1,
          title: "Getting Started Guide",
          description: "Learn the basics of using the API Testing Tool",
          category: "Guides",
          iconName: "BookOpen"
        },
        {
          id: 2,
          title: "API Documentation",
          description: "Detailed documentation for our RESTful API",
          category: "Technical",
          iconName: "FileText"
        },
        {
          id: 3,
          title: "Writing Test Scripts",
          description: "Learn how to write automated tests for your API",
          category: "Testing",
          iconName: "FileText"
        },
        {
          id: 4,
          title: "Using Environment Variables",
          description: "Guide to setting up and using environment variables",
          category: "Environment",
          iconName: "FileText"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    if (!ticketSubject || !ticketMessage) {
      toast.error("Missing information", {
        description: "Please provide both a subject and message for your support request."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await createTicket({
        subject: ticketSubject,
        message: ticketMessage,
        priority: "Medium"
      });
      
      toast.success("Support ticket submitted", {
        description: "We've received your request and will respond shortly."
      });
      
      // Clear form
      setTicketSubject("");
      setTicketMessage("");
      
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast.error("Failed to submit ticket", {
        description: "There was an error submitting your support request. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "FileText": return <FileText className="h-5 w-5 mr-2 text-blue-500" />;
      case "BookOpen": return <BookOpen className="h-5 w-5 mr-2 text-blue-500" />;
      case "Info": return <Info className="h-5 w-5 mr-2 text-blue-500" />;
      default: return <FileText className="h-5 w-5 mr-2 text-blue-500" />;
    }
  };
  
  // Filter and search FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === "" || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get unique FAQ categories
  const faqCategories = ["all", ...new Set(faqs.map(faq => faq.category))].filter(Boolean);
  
  // Filter and search help documents
  const filteredHelpDocuments = helpDocuments.filter(doc => {
    return searchTerm === "" || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Group help documents by category
  const groupedHelpDocuments = filteredHelpDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {});
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={`max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" /> Help & Support
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search for help articles..." 
                className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-10`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full border-b flex-wrap rounded-none justify-start mb-4 bg-transparent">
                <TabsTrigger 
                  value="faq" 
                  className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
                >
                  FAQ
                </TabsTrigger>
                <TabsTrigger 
                  value="docs" 
                  className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
                >
                  Documentation
                </TabsTrigger>
                <TabsTrigger 
                  value="contact" 
                  className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
                >
                  Contact Support
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="faq" className="space-y-6">
                <div className="space-y-4">
                  {filteredFaqs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No FAQs found matching your search criteria.
                    </div>
                  ) : (
                    filteredFaqs.map((item, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-md overflow-hidden ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <div className="p-4">
                          <h3 className="font-medium text-lg mb-2">{item.question}</h3>
                          <p className="text-sm text-gray-500">{item.answer}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="flex items-center"
                    onClick={() => {
                      router.push('/faq');
                      setOpen(false);
                    }}
                  >
                    View All FAQs <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="docs" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredHelpDocuments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 col-span-2">
                      No documents found matching your search criteria.
                    </div>
                  ) : (
                    Object.entries(groupedHelpDocuments).map(([category, docs]) => (
                      <div key={category} className="space-y-4">
                        <div className="font-medium text-lg text-gray-800">
                          {category}
                        </div>
                        
                        {docs.map(doc => (
                          <div 
                            key={doc.id} 
                            className={`p-4 border rounded-md flex flex-col space-y-2 cursor-pointer ${
                              darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <div className="font-medium flex items-center">
                              {getIconComponent(doc.iconName)}
                              {doc.title}
                            </div>
                            <p className="text-sm text-gray-500">{doc.description}</p>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" className="flex items-center">
                    Browse Full Documentation <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-6">
                <div className="space-y-4">
                  <form onSubmit={handleSubmitTicket}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="support-subject">Subject</Label>
                        <Input 
                          id="support-subject" 
                          placeholder="Brief description of your issue" 
                          className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="support-message">Message</Label>
                        <Textarea 
                          id="support-message" 
                          placeholder="Please describe your issue in detail. Include any error messages and steps to reproduce." 
                          rows={6}
                          className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="support-email">Your Email</Label>
                        <Input 
                          id="support-email" 
                          type="email" 
                          placeholder="Your email address" 
                          defaultValue="john.doe@example.com"
                          className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                          value={ticketEmail}
                          onChange={(e) => setTicketEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          className="flex items-center"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                            </>
                          ) : (
                            <>
                              <SendHorizontal className="mr-2 h-4 w-4" /> Send Message
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          Our support team typically responds within 24 hours.
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className={`px-6 py-4 border-t ${darkMode ? "border-gray-700 bg-gray-700/50" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Need immediate help?</span>
              <Button
                variant="outline"
                className="text-sm h-8"
                onClick={() => setIsChatModalOpen(true)}
              >
                <MessageSquare className="mr-2 h-3 w-3" /> Live Chat
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      
      <AIChatModal open={isChatModalOpen} setOpen={setIsChatModalOpen} darkMode={darkMode} />

    </Dialog>
  );
}

export default HelpSupportModal;
export { HelpSupportModal };