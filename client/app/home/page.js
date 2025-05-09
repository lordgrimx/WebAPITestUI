"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/api-tester/LandingPage';
import LoginModal from '@/components/modals/LoginModal';
import SignupModal from '@/components/modals/SignupModal';
import ApiTester from '@/components/api-tester/ApiTester';
import { useAuth, authAxios } from '@/lib/auth-context'; // Import authAxios
import { toast } from 'sonner'; // Import toast

// Ayrı bir bileşen oluşturup useSearchParams'ı burada kullanacağız
import SearchParamsHandler from './SearchParamsHandler';

export default function Home() {
  const router = useRouter();
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
      {/* useSearchParams hook'unu içeren bileşeni Suspense içinde kullanıyoruz */}
      <Suspense fallback={<div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>}>
        <SearchParamsHandler 
          setSharedData={setSharedData} 
          openLoginModal={openLoginModal} 
        />
      </Suspense>

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