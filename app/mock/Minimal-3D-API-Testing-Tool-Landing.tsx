// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState } from 'react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleMethodDropdown = () => {
    setShowMethodDropdown(!showMethodDropdown);
  };

  const selectMethod = (method: string) => {
    setMethod(method);
    setShowMethodDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://public.readdy.ai/ai/img_res/f1a92465c9e5e227a3af7d17f6f7af8b.jpg" 
            alt="API Testing Tool Background" 
            className="w-full h-full object-cover object-top"
          />
        </div>
        
        <div className="relative z-10">
          <header className="container mx-auto px-6 py-4">
            <nav className="flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">API Testing Tool</h1>
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-white hover:text-blue-200 transition-colors cursor-pointer">Features</a>
                <a href="#pricing" className="text-white hover:text-blue-200 transition-colors cursor-pointer">Pricing</a>
                <a href="#docs" className="text-white hover:text-blue-200 transition-colors cursor-pointer">Documentation</a>
                <a href="#about" className="text-white hover:text-blue-200 transition-colors cursor-pointer">About</a>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 text-blue-600 bg-white rounded-lg font-medium hover:bg-gray-100 transition-colors !rounded-button whitespace-nowrap cursor-pointer">Log In</button>
                <button className="px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap cursor-pointer">Sign Up Free</button>
              </div>
            </nav>
          </header>
          
          <div className="container mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">Powerful API Testing Made Simple</h2>
              <p className="text-xl text-blue-100 mb-8">Test, monitor, and debug your APIs with our intuitive platform. Streamline your development workflow and ensure your APIs work flawlessly.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap cursor-pointer">Get Started Free</button>
                <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors !rounded-button whitespace-nowrap cursor-pointer">Watch Demo</button>
              </div>
            </div>
            
            <div className="md:w-1/2 md:pl-10">
              <div className="bg-white rounded-xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm text-gray-500">API Testing Tool</div>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <button 
                      onClick={toggleMethodDropdown}
                      className="w-24 px-3 py-2 bg-gray-100 text-gray-800 rounded-l-lg border border-gray-300 flex items-center justify-between !rounded-button whitespace-nowrap cursor-pointer"
                    >
                      {method}
                      <i className="fas fa-chevron-down text-xs ml-2"></i>
                    </button>
                    
                    {showMethodDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
                          <div 
                            key={m} 
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => selectMethod(m)}
                          >
                            {m}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <input 
                    type="text" 
                    placeholder="https://api.example.com/v1/users" 
                    className="flex-1 px-3 py-2 border border-gray-300 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  
                  <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap cursor-pointer">
                    <i className="fas fa-paper-plane mr-2"></i>
                    Send
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <div className="flex border-b border-gray-200">
                    <button 
                      className={`px-4 py-2 text-sm font-medium ${activeTab === 'params' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'} !rounded-button whitespace-nowrap cursor-pointer`}
                      onClick={() => handleTabClick('params')}
                    >
                      Params
                    </button>
                    <button 
                      className={`px-4 py-2 text-sm font-medium ${activeTab === 'headers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'} !rounded-button whitespace-nowrap cursor-pointer`}
                      onClick={() => handleTabClick('headers')}
                    >
                      Headers
                    </button>
                    <button 
                      className={`px-4 py-2 text-sm font-medium ${activeTab === 'body' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'} !rounded-button whitespace-nowrap cursor-pointer`}
                      onClick={() => handleTabClick('body')}
                    >
                      Body
                    </button>
                    <button 
                      className={`px-4 py-2 text-sm font-medium ${activeTab === 'auth' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'} !rounded-button whitespace-nowrap cursor-pointer`}
                      onClick={() => handleTabClick('auth')}
                    >
                      Auth
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex mb-2">
                      <div className="w-1/2 font-medium text-sm text-gray-600 px-2">KEY</div>
                      <div className="w-1/2 font-medium text-sm text-gray-600 px-2">VALUE</div>
                    </div>
                    
                    <div className="flex mb-2">
                      <div className="w-1/2 px-2">
                        <input 
                          type="text" 
                          placeholder="key" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <input 
                          type="text" 
                          placeholder="value" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center !rounded-button whitespace-nowrap cursor-pointer">
                      <i className="fas fa-plus mr-1"></i> Add Parameter
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center h-32">
                  <div className="text-gray-400 mb-2">
                    <i className="fas fa-code text-3xl"></i>
                  </div>
                  <p className="text-gray-600 font-medium">No Response</p>
                  <p className="text-sm text-gray-500">Click the Send button to make a request</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white" id="features">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to test, document, and monitor your APIs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <i className="fas fa-bolt text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Reliable</h3>
              <p className="text-gray-600">Test your APIs with lightning speed and get instant, reliable results every time.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <i className="fas fa-code text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Code Generation</h3>
              <p className="text-gray-600">Automatically generate code snippets in multiple programming languages.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Monitoring</h3>
              <p className="text-gray-600">Monitor your API performance and get alerts when something goes wrong.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <i className="fas fa-users text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600">Work together with your team in real-time with shared collections and workspaces.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <i className="fas fa-lock text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Testing</h3>
              <p className="text-gray-600">Identify and fix security vulnerabilities in your APIs before they become problems.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <i className="fas fa-file-alt text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600">Automatically generate and maintain comprehensive API documentation.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pricing Section */}
      <div className="py-16 bg-gray-50" id="pricing">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that works best for you and your team</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Free</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  50 API calls per day
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Basic request builder
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Response validation
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  API documentation
                </li>
              </ul>
              <button className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors !rounded-button whitespace-nowrap cursor-pointer">Get Started</button>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-500 transform md:-translate-y-4 relative">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">Popular</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pro</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900">$19</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Unlimited API calls
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Advanced request builder
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Team collaboration (up to 5)
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  API monitoring
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Code generation
                </li>
              </ul>
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap cursor-pointer">Get Started</button>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Enterprise</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900">$49</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Everything in Pro
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Unlimited team members
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Advanced security testing
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Priority support
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Custom integrations
                </li>
              </ul>
              <button className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors !rounded-button whitespace-nowrap cursor-pointer">Contact Sales</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to simplify your API testing?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Join thousands of developers who trust our platform for their API testing needs.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors !rounded-button whitespace-nowrap cursor-pointer">Sign Up Free</button>
            <button className="px-8 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors !rounded-button whitespace-nowrap cursor-pointer">Schedule Demo</button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">API Testing Tool</h3>
              <p className="text-gray-400 mb-4">The most powerful API testing platform for developers and teams.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">API Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Legal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 API Testing Tool. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

