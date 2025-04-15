// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  // Form state
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Validation state
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    hasMinLength: boolean;
    hasUpperLower: boolean;
    hasNumbers: boolean;
    hasSpecial: boolean;
  }>({
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
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};
    
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API registration
      setTimeout(() => {
        setIsLoading(false);
        // Redirect or show success message
        alert('Account created successfully! You can now sign in.');
        window.location.href = 'https://readdy.ai/home/cb224061-3f7c-41e1-b42e-f6abc48d7ed3/98c9cb30-7f43-4974-9b5e-0837dad6dfe4';
      }, 1500);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative">
          {/* 3D Background Elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-xl rotate-12 animate-float"></div>
          <div className="absolute top-40 -right-16 w-32 h-32 bg-cyan-500/10 rounded-xl -rotate-12 animate-float-delayed"></div>
          <div className="absolute -bottom-16 -left-10 w-24 h-24 bg-indigo-500/10 rounded-xl rotate-45 animate-float-slow"></div>
          
          {/* Sign Up Card */}
          <div className="w-full max-w-md backdrop-blur-lg bg-white/90 rounded-xl shadow-xl overflow-hidden z-10 relative">
            <div className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-[#1A2333]">API Testing Tool</h1>
                <p className="text-gray-500 mt-2">Create your account</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Full Name Field */}
                  <div className="relative">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all duration-200`}
                        placeholder="John Doe"
                      />
                      <i className="fa fa-user absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                  </div>
                  
                  {/* Email Field */}
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all duration-200`}
                        placeholder="your@email.com"
                      />
                      <i className="fa fa-envelope absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  
                  {/* Password Field */}
                  <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all duration-200`}
                        placeholder="••••••••"
                      />
                      <i className="fa fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
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
                          <i className={`fa ${passwordStrength.hasMinLength ? 'fa-check-circle' : 'fa-circle'} mr-1`}></i>
                          <span>Minimum 8 characters</span>
                        </div>
                        <div className={`flex items-center ${passwordStrength.hasUpperLower ? 'text-green-600' : 'text-gray-500'}`}>
                          <i className={`fa ${passwordStrength.hasUpperLower ? 'fa-check-circle' : 'fa-circle'} mr-1`}></i>
                          <span>Upper & lowercase</span>
                        </div>
                        <div className={`flex items-center ${passwordStrength.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                          <i className={`fa ${passwordStrength.hasNumbers ? 'fa-check-circle' : 'fa-circle'} mr-1`}></i>
                          <span>Contains numbers</span>
                        </div>
                        <div className={`flex items-center ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                          <i className={`fa ${passwordStrength.hasSpecial ? 'fa-check-circle' : 'fa-circle'} mr-1`}></i>
                          <span>Special characters</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Confirm Password Field */}
                  <div className="relative">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all duration-200`}
                        placeholder="••••••••"
                      />
                      <i className="fa fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                  
                  {/* Terms of Service */}
                  <div className="relative">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={() => setAcceptTerms(!acceptTerms)}
                          className={`h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer ${errors.terms ? 'border-red-500' : ''}`}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="text-gray-700 cursor-pointer">
                          I agree to the <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</a>
                        </label>
                      </div>
                    </div>
                    {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 !rounded-button whitespace-nowrap cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <i className="fa fa-circle-notch fa-spin mr-2"></i>
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>
              
              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="https://readdy.ai/home/cb224061-3f7c-41e1-b42e-f6abc48d7ed3/98c9cb30-7f43-4974-9b5e-0837dad6dfe4" data-readdy="true" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
            
            {/* Bottom Section */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6 text-center">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 text-blue-700">
                  <i className="fa fa-bolt"></i>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/20 text-green-700">
                  <i className="fa fa-code"></i>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 text-purple-700">
                  <i className="fa fa-terminal"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-4">Powerful API testing with modern tools</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default App;

