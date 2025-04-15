"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoadingPage({ darkMode }) {
  const [loadingText, setLoadingText] = useState("Loading");
  
  // Cycling through loading text with dots for visual feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prev) => {
        if (prev === "Loading...") return "Loading";
        return prev + ".";
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      className={`h-screen w-full flex flex-col items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className={`h-24 w-24 rounded-full ${darkMode ? "bg-gray-800" : "bg-white"} flex items-center justify-center shadow-lg`}>
            <Loader2 
              className={`h-12 w-12 animate-spin ${darkMode ? "text-blue-400" : "text-blue-600"}`} 
            />
          </div>
          <div 
            className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full 
                      ${darkMode ? "bg-blue-600" : "bg-blue-500"} 
                      flex items-center justify-center animate-pulse`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
        </div>
        
        <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
          API Testing Tool
        </h1>
        
        <div className="flex flex-col items-center">
          <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {loadingText}
          </p>
          <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Preparing your workspace...
          </p>
        </div>
        
        <div className={`w-64 h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"} mt-4`}>
          <div 
            className="h-full bg-blue-500 rounded-full animate-loading-bar"
            style={{
              width: '90%',
              animation: 'loading 2s infinite'
            }}
          ></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          75% {
            width: 85%;
          }
          90% {
            width: 90%;
          }
          100% {
            width: 95%;
          }
        }
      `}</style>
    </div>
  );
}