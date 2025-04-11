"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import LoadingPage from "./LoadingPage";

export default function LoadingWrapper({ children }) {
  const [showLoading, setShowLoading] = useState(false);
  const { theme } = useTheme();
    useEffect(() => {
    // Check if we should show loading screen on initial render
    const shouldShowLoading = localStorage.getItem("showLoading") === "true";
    setShowLoading(shouldShowLoading);
    
    // Clear the loading flag immediately
    if (shouldShowLoading) {
      localStorage.removeItem("showLoading");
      
      // Set a timeout to hide the loading screen after a short delay
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1000); // 1 second delay should be enough for the page to load
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Add a separate effect to handle complete page load
  useEffect(() => {
    if (showLoading) {
      const handleLoad = () => {
        // Hide loading when page is fully loaded
        setShowLoading(false);
      };
      
      // Check if window is fully loaded
      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, [showLoading]);
  
  // If we're showing the loading screen, return that instead of children
  if (showLoading) {
    return <LoadingPage darkMode={theme === "dark"} />;
  }
  
  // Otherwise, render children normally
  return children;
}