"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import LandingPage from '@/components/api-tester/LandingPage';
import LoginModal from '@/components/modals/LoginModal';
import SignupModal from '@/components/modals/SignupModal';
import ApiTester from '@/components/api-tester/ApiTester';
import { useAuth, authAxios } from '@/lib/auth-context'; // Import authAxios
import { toast } from 'sonner'; // Import toast

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, isLoading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [sharedData, setSharedData] = useState(null); // New state for shared data

  const openSignupModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };
  const closeSignupModal = () => setShowSignupModal(false);

  const openLoginModal = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };
  const closeLoginModal = () => setShowLoginModal(false);

  const switchToSignupModal = () => {
    closeLoginModal();
    openSignupModal();
  };

  const switchToLoginModal = () => {
    closeSignupModal();
    openLoginModal();
  };

  useEffect(() => {
    if (!isLoading) {
      setIsPageLoading(false);
    }
  }, [isLoading]);

  // Effect to handle shared data from URL
  useEffect(() => {
    const shareId = searchParams.get('shareId');
    if (shareId) {
      const fetchSharedData = async () => {
        try {
          // Assuming auth is not strictly required to fetch shared data,
          // but using authAxios for consistency if needed later.
          // If shared data should be public, use a regular axios instance.
          const response = await authAxios.get(`/api/SharedData/${shareId}`);
          setSharedData(response.data);
          // Clear the shareId from the URL after fetching
          router.replace(router.pathname);
        } catch (error) {
          console.error("Failed to fetch shared data:", error);
          toast.error("Failed to load shared data", { description: error.message });
          setSharedData(null); // Clear shared data on error
          router.replace(router.pathname); // Clear the shareId from the URL on error
        }
      };
      fetchSharedData();
    }
  }, [searchParams, router]); // Depend on searchParams and router

  // Original effect for redirecting authenticated users
  useEffect(() => {
    if (!isLoading && user) {
      // Consider if you still want to redirect if sharedData is present
      // For now, let's keep the redirect if user is logged in and no shared data is being processed
      if (!sharedData) {
         router.push('/home');
      }
    }
  }, [user, isLoading, router, sharedData]); // Add sharedData to dependencies

  if (isPageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      {!user ? (
        <LandingPage
          openSignupModal={openSignupModal}
          openLoginModal={openLoginModal}
        />
      ) : (
        <ApiTester initialSharedData={sharedData} />
      )}

      <SignupModal
        isOpen={showSignupModal}
        onClose={closeSignupModal}
        onSwitchToLogin={switchToLoginModal}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        onSwitchToSignup={switchToSignupModal}
      />
    </div>
  );
}