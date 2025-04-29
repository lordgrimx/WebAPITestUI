"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/api-tester/LandingPage';
import LoginModal from '@/components/modals/LoginModal';
import SignupModal from '@/components/modals/SignupModal';
import ApiTester from '@/components/api-tester/ApiTester';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, isLoading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);

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

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/home');
    }
  }, [user, isLoading, router]);

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
        <ApiTester />
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