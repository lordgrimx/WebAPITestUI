"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { CheckCircle, Circle, Lock, Mail, User } from 'lucide-react';
import { toast } from "sonner";
import { useTheme } from 'next-themes';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperLower: false,
    hasNumbers: false,
    hasSpecial: false
  });
  
  // Check password strength
  useEffect(() => {
    const strength = {
      score: 0,
      hasMinLength: password.length >= 8,
      hasUpperLower: /(?=.*[a-z])(?=.*[A-Z])/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    let score = 0;
    if (strength.hasMinLength) score++;
    if (strength.hasUpperLower) score++;
    if (strength.hasNumbers) score++;
    if (strength.hasSpecial) score++;
    
    strength.score = score;
    setPasswordStrength(strength);
  }, [password]);
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Ad soyad gereklidir';
    }
    
    if (!email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Geçersiz e-posta formatı';
    }
    
    if (!password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Şifre çok zayıf';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Lütfen şifreyi doğrulayın';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'Kullanım şartlarını kabul etmelisiniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        const result = await register(fullName, email, password);
        
        if (result.success) {
          if (result.token) {
            localStorage.setItem('token', result.token);
          }
          toast.success('Hesap başarıyla oluşturuldu!');
          onClose();
          if (onSwitchToLogin) {
            setTimeout(() => onSwitchToLogin(), 100);
          }
        } else {
          toast.error(result.error || 'Kayıt başarısız oldu');
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Add max height and overflow styles */}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 w-[95%] mx-auto">
        <div className="relative overflow-hidden rounded-lg">
          {/* 3D Background Elements - These will be visible behind the form */}
          <div className={`absolute -top-20 -left-20 w-40 h-40 ${isDarkMode ? 'bg-blue-500/5' : 'bg-blue-500/10'} rounded-xl rotate-12 animate-float opacity-50`}></div>
          <div className={`absolute top-40 -right-16 w-32 h-32 ${isDarkMode ? 'bg-cyan-500/5' : 'bg-cyan-500/10'} rounded-xl -rotate-12 animate-float-delayed opacity-50`}></div>
          <div className={`absolute -bottom-16 -left-10 w-24 h-24 ${isDarkMode ? 'bg-indigo-500/5' : 'bg-indigo-500/10'} rounded-xl rotate-45 animate-float-slow opacity-50`}></div>
          
          <div className={`relative z-10 p-4 sm:p-8 ${isDarkMode ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'}`}>
            <div className="text-center mb-4 sm:mb-8">
              <DialogTitle className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1A2333]'}`}>
                API Testing Tool
              </DialogTitle>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Hesabınızı oluşturun</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {/* Full Name Field */}
              <div>
                <Label htmlFor="fullName" className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ad Soyad
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 sm:py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-600/50 focus:border-blue-600' : 'bg-gray-50 border'} ${errors.fullName ? 'border-red-500 focus:ring-red-500' : isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    placeholder="John Doe"
                  />
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                {errors.fullName && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.fullName}</p>}
              </div>
              
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  E-posta
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 sm:py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-600/50 focus:border-blue-600' : 'bg-gray-50 border'} ${errors.email ? 'border-red-500 focus:ring-red-500' : isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    placeholder="your@email.com"
                  />
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                {errors.email && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>}
              </div>
              
              {/* Password Field */}
              <div>
                <Label htmlFor="password" className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Şifre
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 sm:py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-600/50 focus:border-blue-600' : 'bg-gray-50 border'} ${errors.password ? 'border-red-500 focus:ring-red-500' : isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    placeholder="••••••••"
                  />
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                {errors.password && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>}
                
                {/* Password Strength Indicator */}
                <div className="mt-2">
                  <div className="flex items-center mb-1">
                    <div className={`flex-1 h-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                      <div 
                        className={`h-full ${
                          passwordStrength.score === 0 ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-200') : 
                          passwordStrength.score === 1 ? 'bg-red-500' : 
                          passwordStrength.score === 2 ? 'bg-yellow-500' : 
                          passwordStrength.score === 3 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength.score * 25}%` }}
                      ></div>
                    </div>
                    <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {passwordStrength.score === 0 ? 'Zayıf' : 
                       passwordStrength.score === 1 ? 'Zayıf' : 
                       passwordStrength.score === 2 ? 'Orta' : 
                       passwordStrength.score === 3 ? 'İyi' : 'Güçlü'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs">
                    <div className={`flex items-center ${passwordStrength.hasMinLength ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-500')}`}>
                      {passwordStrength.hasMinLength ? (
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      ) : (
                        <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      )}
                      <span>En az 8 karakter</span>
                    </div>
                    <div className={`flex items-center ${passwordStrength.hasUpperLower ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-500')}`}>
                      {passwordStrength.hasUpperLower ? (
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      ) : (
                        <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      )}
                      <span>Büyük & küçük harf</span>
                    </div>
                    <div className={`flex items-center ${passwordStrength.hasNumbers ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-500')}`}>
                      {passwordStrength.hasNumbers ? (
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      ) : (
                        <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      )}
                      <span>Rakam içermeli</span>
                    </div>
                    <div className={`flex items-center ${passwordStrength.hasSpecial ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-500')}`}>
                      {passwordStrength.hasSpecial ? (
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      ) : (
                        <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      )}
                      <span>Özel karakter</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Confirm Password Field */}
              <div>
                <Label htmlFor="confirmPassword" className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Şifre Tekrarı
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 sm:py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-600/50 focus:border-blue-600' : 'bg-gray-50 border'} ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    placeholder="••••••••"
                  />
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
              
              {/* Terms of Service */}
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={() => setAcceptTerms(!acceptTerms)}
                    className={`${errors.terms ? 'border-red-500' : ''} ${isDarkMode ? 'border-gray-600 bg-gray-800' : ''}`}
                  />
                </div>
                <div className="ml-3 text-xs sm:text-sm">
                  <Label htmlFor="terms" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}>
                    <a href="#" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} font-medium`}>Kullanım Şartları</a> ve <a href="#" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} font-medium`}>Gizlilik Politikası</a>'nı kabul ediyorum
                  </Label>
                </div>
              </div>
              {errors.terms && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.terms}</p>}
              
              {/* Submit Button */}
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
                    <span className="text-sm sm:text-base">Hesap oluşturuluyor...</span>
                  </div>
                ) : (
                  <span className="text-sm sm:text-base">Hesap Oluştur</span>
                )}
              </Button>
              
              {/* Sign In Link */}
              <div className="mt-4 text-center">
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Zaten bir hesabınız var mı?{' '}
                  <button 
                    onClick={onSwitchToLogin}
                    className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors underline`}
                  >
                    Giriş yap
                  </button>
                </p>
              </div>
            </form>
          </div>
          
          {/* Bottom Section with Icons */}
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
  );
};

export default SignupModal;

// CSS Animations for the floating backgrounds
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

// Add animations to global.css
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}