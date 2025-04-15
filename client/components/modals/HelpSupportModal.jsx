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
import { X, HelpCircle, MessageSquare, Search, FileText, ExternalLink } from "lucide-react";
import { useState } from "react";

function HelpSupportModal({ open, setOpen, darkMode }) {
  const [activeTab, setActiveTab] = useState("faq");
  
  const faqItems = [
    {
      question: "How do I create a new API request?",
      answer: "To create a new API request, click on the '+' button in the top left corner of the sidebar and select 'New Request'. You can then specify the request method, URL, and other details."
    },
    {
      question: "How do I save an API request?",
      answer: "After configuring your API request, click the 'Save' button in the top navigation bar. You can provide a name, description, and select a collection to save it to."
    },
    {
      question: "How do I share my API requests with team members?",
      answer: "You can share API requests by clicking the 'Share' button in the top navigation bar. You can generate a shareable link or directly share with specific team members if you're on a team plan."
    },
    {
      question: "How do I set up environment variables?",
      answer: "Click on the 'Environment' dropdown in the top navigation bar. Here you can create new environments and define variables that can be used across your API requests."
    },
    {
      question: "How do I run automated tests?",
      answer: "In the request builder, navigate to the 'Tests' tab where you can write JavaScript test scripts that will be executed after your request completes. The results will be displayed in the Test Results panel."
    }
  ];
  
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
                  {faqItems.map((item, index) => (
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
                  ))}
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" className="flex items-center">
                    View All FAQs <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="docs" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`p-4 border rounded-md flex flex-col space-y-2 cursor-pointer ${
                      darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      Getting Started Guide
                    </div>
                    <p className="text-sm text-gray-500">Learn the basics of using the API Testing Tool</p>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-md flex flex-col space-y-2 cursor-pointer ${
                      darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      API Documentation
                    </div>
                    <p className="text-sm text-gray-500">Detailed documentation for our RESTful API</p>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-md flex flex-col space-y-2 cursor-pointer ${
                      darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      Writing Test Scripts
                    </div>
                    <p className="text-sm text-gray-500">Learn how to write automated tests for your API</p>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-md flex flex-col space-y-2 cursor-pointer ${
                      darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      Using Environment Variables
                    </div>
                    <p className="text-sm text-gray-500">Guide to setting up and using environment variables</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" className="flex items-center">
                    Browse Full Documentation <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="support-subject">Subject</Label>
                    <Input 
                      id="support-subject" 
                      placeholder="Brief description of your issue" 
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="support-message">Message</Label>
                    <Textarea 
                      id="support-message" 
                      placeholder="Please describe your issue in detail. Include any error messages and steps to reproduce." 
                      rows={6}
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
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
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Our support team typically responds within 24 hours.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className={`px-6 py-4 border-t ${darkMode ? "border-gray-700 bg-gray-700/50" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Need immediate help?</span>
              <Button variant="outline" className="text-sm h-8">
                <MessageSquare className="mr-2 h-3 w-3" /> Live Chat
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default HelpSupportModal;
export { HelpSupportModal };