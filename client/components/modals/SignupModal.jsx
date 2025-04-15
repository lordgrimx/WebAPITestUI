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

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register } = useAuth();

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
      newErrors.fullName = 'Full name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms of service';
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
          toast.success('Account created successfully!');
          setTimeout(() => {
            onClose();
            if (onSwitchToLogin) {
              setTimeout(() => onSwitchToLogin(), 100);
            }
          }, 1000);
        } else {
          toast.error(result.error || 'Registration failed');
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#1A2333]">
            API Testing Tool
          </DialogTitle>
          <p className="text-center text-gray-500 mt-2">Create your account</p>
        </DialogHeader>
        <div className="relative">
          {/* 3D Background Elements - These will be visible behind the form */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-xl rotate-12 animate-float"></div>
          <div className="absolute top-40 -right-16 w-32 h-32 bg-cyan-500/10 rounded-xl -rotate-12 animate-float-delayed"></div>
          <div className="absolute -bottom-16 -left-10 w-24 h-24 bg-indigo-500/10 rounded-xl rotate-45 animate-float-slow"></div>
          
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10 p-2">
            {/* Full Name Field */}
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <div className="relative mt-1">
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                  placeholder="John Doe"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>
            
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative mt-1">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                  placeholder="your@email.com"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              
              {/* Password Strength Indicator */}
              <div className="mt-2">
                <div className="flex items-center mb-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        passwordStrength.score === 0 ? 'bg-gray-200' : 
                        passwordStrength.score === 1 ? 'bg-red-500' : 
                        passwordStrength.score === 2 ? 'bg-yellow-500' : 
                        passwordStrength.score === 3 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength.score * 25}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {passwordStrength.score === 0 ? 'Weak' : 
                     passwordStrength.score === 1 ? 'Weak' : 
                     passwordStrength.score === 2 ? 'Fair' : 
                     passwordStrength.score === 3 ? 'Good' : 'Strong'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasMinLength ? (
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span>Minimum 8 characters</span>
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasUpperLower ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasUpperLower ? (
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span>Upper & lowercase</span>
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasNumbers ? (
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span>Contains numbers</span>
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasSpecial ? (
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span>Special characters</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Confirm Password Field */}
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
            
            {/* Terms of Service */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={() => setAcceptTerms(!acceptTerms)}
                  className={errors.terms ? 'border-red-500' : ''}
                />
              </div>
              <div className="ml-3 text-sm">
                <Label htmlFor="terms" className="text-gray-700 cursor-pointer">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</a>
                </Label>
              </div>
            </div>
            {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
            
            {/* Sign In Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
        
        {/* Bottom Section with Icons */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 text-center mt-4 rounded-b-lg">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20 text-purple-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-2">Powerful API testing with modern tools</p>
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