"use client";

import { useEffect, useState } from 'react';
import LandingPage from '@/components/api-tester/LandingPage';
import LoginModal from '@/components/modals/LoginModal'; // Import LoginModal
import SignupModal from '@/components/modals/SignupModal'; // Ensure SignupModal is imported
import ApiTester from '@/components/api-tester/ApiTester'; // Import ApiTester
import { useAuth } from '@/lib/auth-context'; // Auth context import eklendi


export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // State for LoginModal
  const { user, isLoading } = useAuth(); // Auth context'ten user ve isLoading durumlarını al
  // Yükleme durumunu göstermek için bir state tanımlayalım
  const [isPageLoading, setIsPageLoading] = useState(true);

  const openSignupModal = () => {
    setShowLoginModal(false); // Close login if open
    setShowSignupModal(true);
  };
  const closeSignupModal = () => setShowSignupModal(false);

  const openLoginModal = () => {
    setShowSignupModal(false); // Close signup if open
    setShowLoginModal(true);
  };
  const closeLoginModal = () => setShowLoginModal(false);

  // Function to switch from Login to Signup
  const switchToSignupModal = () => {
    closeLoginModal();
    openSignupModal();
  };

  // Function to switch from Signup to Login (if needed in SignupModal)
  const switchToLoginModal = () => {
    closeSignupModal();
    openLoginModal();
  };

  // Sayfa yüklendiğinde auth context'in hazır olmasını bekleyelim
  useEffect(() => {
    // isLoading false olduğunda auth context hazır demektir
    if (!isLoading) {
      setIsPageLoading(false);
    }
  }, [isLoading]);

  // Eğer auth context hala yükleniyorsa, loading gösterelim
  if (isPageLoading) {
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Auth context hazır olduğunda ana içeriği render edelim
  return (
    <div className={`h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {!user ? (
        <LandingPage
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          openSignupModal={openSignupModal}
          openLoginModal={openLoginModal}
        />
      ) : (
        <>
          <ApiTester
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            openSignupModal={openSignupModal}
            openLoginModal={openLoginModal}
          />
        </>
      )}

      {/* Render Modals */}
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