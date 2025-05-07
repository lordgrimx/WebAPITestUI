"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../lib/auth-context'; 
import { toast } from 'sonner';
import TwoFactorModal from './TwoFactorModal';
import { useTheme } from 'next-themes';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const { login, verify2FA } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  
  const handleLogin2 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // İki faktörlü doğrulama aşamasında ise doğrulama işlemini yap
    if (is2FARequired) {
      try {
        if (!verificationCode) {
          setError('Lütfen doğrulama kodunu girin');
          setIsLoading(false);
          return;
        }
        
        const result = await verify2FA(pendingUserId, verificationCode);
        
        if (result.success) {
          toast.success("Giriş başarılı!");
          onClose();
          if (result.token) {
            localStorage.setItem('token', result.token);
          }
          window.location.reload();
        } else {
          setError(result.error || 'Geçersiz doğrulama kodu');
          toast.error(result.error || "Doğrulama başarısız");
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Normal giriş aşaması
    try {
      const result = await login(email, password);
      
      if (!result.success) {
        // Check if 2FA is required
        if (result.requires2FA && result.userId) {
          setPendingUserId(result.userId);
          setIs2FARequired(true);
          toast.info("E-posta adresinize gönderilen doğrulama kodunu girin");
          setIsLoading(false);
          return;
        }
        
        setError(result.error || 'Giriş başarısız');
        toast.error(result.error || "Giriş başarısız");
        return;
      }

      toast.success("Giriş başarılı!");
      onClose();
      // Change this to use local storage or context instead of window reload
      if (result.token) {
        localStorage.setItem('token', result.token);
      }
      window.location.reload();

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handle2FAVerification = async (code) => {
    try {
      const result = await verify2FA(pendingUserId, code);
      
      if (result.success) {
        toast.success("2FA doğrulama başarılı!");
        setShow2FAModal(false);
        onClose();
        localStorage.setItem("showLoading", "true");
        window.location.reload();
        return true;
      } else {
        throw new Error(result.error || "Geçersiz doğrulama kodu");
      }
    } catch (error) {
      console.error("2FA doğrulaması başarısız:", error);
      throw error;
    }
  };
  
  const handle2FACancel = () => {
    setShow2FAModal(false);
    setPendingUserId(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 w-[95%] mx-auto">
          <div className="relative overflow-hidden rounded-lg">
            <div className={`absolute -top-10 -left-10 w-32 h-32 ${isDarkMode ? 'bg-blue-500/5' : 'bg-blue-500/10'} rounded-xl rotate-12 animate-float opacity-50`}></div>
            <div className={`absolute top-20 -right-10 w-24 h-24 ${isDarkMode ? 'bg-cyan-500/5' : 'bg-cyan-500/10'} rounded-xl -rotate-12 animate-float-delayed opacity-50`}></div>
            <div className={`absolute -bottom-10 -left-5 w-20 h-20 ${isDarkMode ? 'bg-indigo-500/5' : 'bg-indigo-500/10'} rounded-xl rotate-45 animate-float-slow opacity-50`}></div>

            <div className={`relative z-10 p-4 sm:p-8 ${isDarkMode ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'}`}>
              <div className="text-center mb-4 sm:mb-8">
                <DialogTitle className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1A2333]'}`}>
                  API Testing Tool
                </DialogTitle>
                <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Çalışma alanınıza erişmek için giriş yapın</p>
              </div>

              <form onSubmit={handleLogin2} className="space-y-4 sm:space-y-5">
                {!is2FARequired ? (
                  <>
                    <div>
                      <Label htmlFor="email-login" className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        E-posta
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="email-login"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 sm:py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-600/50 focus:border-blue-600' : 'bg-gray-50 border'} ${error ? 'border-red-300' : isDarkMode ? 'border-gray-700' : 'border-gray-200'} focus:ring-blue-500/50 focus:border-blue-500`}
                          placeholder="your@email.com"
                          required
                        />
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password-login" className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Şifre
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="password-login"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 sm:py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-600/50 focus:border-blue-600' : 'bg-gray-50 border'} ${error ? 'border-red-300' : isDarkMode ? 'border-gray-700' : 'border-gray-200'} focus:ring-blue-500/50 focus:border-blue-500`}
                          placeholder="••••••••"
                          required
                        />
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center">
                        <Checkbox 
                          id="remember-me-login" 
                          checked={rememberMe}
                          onCheckedChange={setRememberMe}
                          className={`mr-2 ${isDarkMode ? 'border-gray-600 bg-gray-800' : ''}`}
                        />
                        <Label htmlFor="remember-me-login" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}>
                          Beni hatırla
                        </Label>
                      </div>
                      <a href="#" className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}>
                        Şifremi unuttum
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className={`${isDarkMode ? 'bg-blue-900/40 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-md p-3 sm:p-4 text-center`}>
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                        E-posta adresinize bir doğrulama kodu gönderildi.
                        <br />Devam etmek için kodu aşağıya girin.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="verification-code" className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Doğrulama Kodu
                      </Label>
                      <Input
                        id="verification-code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className={`w-full py-2 sm:py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border'} text-center text-base sm:text-lg tracking-widest font-mono ${error ? 'border-red-300' : isDarkMode ? 'border-gray-700' : 'border-gray-200'} focus:ring-blue-500/50 focus:border-blue-500`}
                        placeholder="123456"
                        maxLength={6}
                        required
                        autoFocus
                      />
                      <div className="text-center mt-2">
                        <button 
                          type="button" 
                          onClick={() => setIs2FARequired(false)}
                          className={`text-xs sm:text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} font-medium`}
                        >
                          Giriş ekranına dön
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-xs sm:text-sm text-red-600 text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'} text-white font-medium py-2 sm:py-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm sm:text-base">{is2FARequired ? 'Doğrulanıyor...' : 'Giriş yapılıyor...'}</span>
                    </div>
                  ) : (
                    <span className="text-sm sm:text-base">{is2FARequired ? 'Kodu Doğrula' : 'Giriş Yap'}</span>
                  )}
                </Button>
              </form>

              <div className="mt-4 sm:mt-6 text-center">
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Hesabınız yok mu?{' '}
                  <button 
                    onClick={onSwitchToSignup} 
                    className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors underline`}
                  >
                    Kayıt ol
                  </button>
                </p>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gradient-to-r from-blue-900/20 to-cyan-900/20' : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'} p-4 sm:p-6 text-center relative z-10 rounded-b-lg`}>
              <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${isDarkMode ? 'bg-blue-800/30 text-blue-400' : 'bg-blue-500/20 text-blue-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${isDarkMode ? 'bg-green-800/30 text-green-400' : 'bg-green-500/20 text-green-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                </div>
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${isDarkMode ? 'bg-purple-800/30 text-purple-400' : 'bg-purple-500/20 text-purple-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
              </div>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-3 sm:mt-4`}>Modern araçlarla güçlü API testi</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginModal;

const styles = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(12deg); }
    50% { transform: translateY(-10px) rotate(12deg); }
    100% { transform: translateY(0px) rotate(12deg); }
  }
  @keyframes float-delayed {
    0% { transform: translateY(0px) rotate(-12deg); }
    50% { transform: translateY(-15px) rotate(-12deg); }
    100% { transform: translateY(0px) rotate(-12deg); }
  }
  @keyframes float-slow {
    0% { transform: translateY(0px) rotate(45deg); }
    50% { transform: translateY(-5px) rotate(45deg); }
    100% { transform: translateY(0px) rotate(45deg); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-float-delayed {
    animation: float-delayed 8s ease-in-out infinite;
  }
  .animate-float-slow {
    animation: float-slow 10s ease-in-out infinite;
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('modal-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'modal-animations';
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}