"use client";

import { useEffect, useState } from 'react';
import LandingPage from '@/components/api-tester/LandingPage';
import LoginModal from '@/components/modals/LoginModal'; // Import LoginModal
import SignupModal from '@/components/modals/SignupModal'; // Ensure SignupModal is imported
import ApiTester from '@/components/api-tester/ApiTester'; // Import ApiTester
import Header from '@/components/Header';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // State for LoginModal

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

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const userId = document.cookie
        .split('; ')
        .find(row => row.startsWith('userId='))
        ?.split('=')[1];
      console.log('User ID from cookie:', userId); // Debugging line
      setIsLoggedIn(!!userId);
    };

    checkLoginStatus();
    // You could add an event listener here if needed for login state changes

    // No JSX should be returned from useEffect
  }, []);
  return (
    <div className={`h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {!isLoggedIn ? (
        <LandingPage
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          openSignupModal={openSignupModal}
          openLoginModal={openLoginModal}
        />
      ) : (
        <>
          <Header
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            openSignupModal={openSignupModal}
            openLoginModal={openLoginModal}
          />
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
