import React from 'react'
import Header from '../Header'
import { Button } from '../ui/button'
import Image from 'next/image'
import { Zap, Code, ChartLine, Users, Shield, BookMarked, Check } from 'lucide-react'

// Destructure openLoginModal from props
export default function LandingPage({ darkMode, setDarkMode, openSignupModal, openLoginModal }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans m-0 p-0">
      {/* Hero */}
      <div className="relative overflow-hidden min-h-screen m-0 p-0">
        <div className="z-10 relative">
          {/* Pass openLoginModal down to the Header component */}
          <Header 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            openSignupModal={openSignupModal} 
            openLoginModal={openLoginModal} // Pass it down
          />
        </div>
        <div className="absolute inset-0 z-0">
          <Image
            src={"/landingpage.jpeg"}
            alt="Hero Image"
            width={500}
            height={300}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="z-10 relative mt-40 w-full ml-20 flex justify-start items-center">
          <div className="w-1/2">
            <div className="mt-5">
              <h1 className="text-5xl text-gray-100">
                Powerfull API Testing Made Simple
              </h1>
            </div>
            <div>
              <p className="text-lg text-gray-200 mt-4">
                Test, monitor, and debug your APIs with our intuitive platform.
                Streamline your development workflow and ensure your APIs work
                flawlessly.
              </p>
            </div>
            <div className="flex items-center mt-5">
              <Button
                variant={"default"}
                className="bg-blue-500 text-white hover:bg-blue-600 mr-7 h-12"
                onClick={openSignupModal}
              >
                Get Started Free
              </Button>
              <Button variant={"outline"} className="h-12 hover:bg-gray-400">
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="w-1/2 flex justify-end mr-30">
            <div className="w-2xl h-xl bg-white rounded-lg shadow-lg p-5">
              <Image
                src={"/document.png"}
                alt="landingSum"
                width={1200}
                height={300}
                className="p-0 m-0 rounded"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Features */}
      <div className="min-h-screen bg-white font-sans m-0 p-0">
        <div className="flex flex-col justify-start items-center mt-20">
          <h2 className="text-5xl text-gray-800">Powerful Features</h2>
          <h3 className="text-2xl mt-7 font-light text-gray-500 tracking-wide">
            Everything you need to test, document, and monitor your APIs
          </h3>
        </div>
        <div className="flex justify-start items-start mt-20 flex-wrap ml-10 mr-10 mb-20">
          <div className="flex flex-col justify-center items-start w-1/3 max-w-[30%] bg-gray-50 border-1 border-gray-200 rounded-lg shadow-lg p-5 m-5 hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:bg-gray-150">
            <div className="flex justify-center items-center p-4 bg-blue-100 rounded-lg">
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl mt-5">Fast & Reliable</h2>
              <p className="text-lg font-light text-gray-800">
                Test your APIs with lightning speed and get instant, reliable
                results every time.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start w-1/3 max-w-[30%] bg-gray-50 border-1 border-gray-200 rounded-lg shadow-lg p-5 m-5 hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:bg-gray-150">
            <div className="flex justify-center items-center p-4 bg-blue-100 rounded-lg">
              <Code className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl mt-5">Code Generation</h2>
              <p className="text-lg font-light text-gray-800">
                Automatically generate code snippets in multiple programming
                languages.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start w-1/3 max-w-[30%] bg-gray-50 border-1 border-gray-200 rounded-lg shadow-lg p-5 m-5 hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:bg-gray-150">
            <div className="flex justify-center items-center p-4 bg-blue-100 rounded-lg">
              <ChartLine className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl mt-5">Monitoring</h2>
              <p className="text-lg font-light text-gray-800">
                Monitor your API performance and get alerts when something goes
                wrong.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start w-1/3 max-w-[30%] bg-gray-50 border-1 border-gray-200 rounded-lg shadow-lg p-5 m-5 hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:bg-gray-150">
            <div className="flex justify-center items-center p-4 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl mt-5">Team Collaboration</h2>
              <p className="text-lg font-light text-gray-800">
                Work together with your team in real-time with shared
                collections and workspaces.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start w-1/3 max-w-[30%] bg-gray-50 border-1 border-gray-200 rounded-lg shadow-lg p-5 m-5 hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:bg-gray-150">
            <div className="flex justify-center items-center p-4 bg-blue-100 rounded-lg">
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl mt-5">Security Testing</h2>
              <p className="text-lg font-light text-gray-800">
                Identify and fix security vulnerabilities in your APIs before
                they become problems.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start w-1/3 max-w-[30%] bg-gray-50 border-1 border-gray-200 rounded-lg shadow-lg p-5 m-5 hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:bg-gray-150">
            <div className="flex justify-center items-center p-4 bg-blue-100 rounded-lg">
              <BookMarked className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl mt-5">Documentation</h2>
              <p className="text-lg font-light text-gray-800">
                Automatically generate and maintain comprehensive API
                documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Pricing */}
      <div className="min-h-screen bg-gray-50 font-sans m-0 p-0">
        <div className="flex flex-col justify-start items-center mt-20">
          <div>
            <h2 className="text-4xl text-center ">Simple, Transparent Pricing</h2>
            <h3 className="text-2xl font-light text-gray-500 mt-4 tracking-wide">
              Choose the plan that works best for you and your team
            </h3>
          </div>{" "}
          <div className="flex justify-center items-center mt-20 flex-wrap mb-20 w-full max-w-7xl mx-auto px-4 sm:px-6">
            {/* Free Plan */}
            <div className="flex flex-col justify-between bg-white border border-gray-200 w-full sm:w-[90%] md:w-[45%] lg:w-[30%] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-6 lg:p-8 m-3 sm:m-4 lg:m-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Free</h2>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>50 API calls per day</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Basic request builder</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Response validation</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>API documentation</span>
                  </li>
                </ul>
              </div>              <Button 
                className="w-full py-3 bg-gray-100 text-gray-800 hover:bg-gray-200"
                onClick={openSignupModal}
              >
                Get Started Free
              </Button>
            </div>
            {/* Pro Plan - Popular */}
            <div className="flex flex-col justify-between bg-white border-2 border-blue-500 w-full sm:w-[90%] md:w-[45%] lg:w-[30%] rounded-xl shadow-lg transform lg:-translate-y-4 relative p-4 sm:p-6 lg:p-8 m-3 sm:m-4 lg:m-5">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs sm:text-sm font-medium">
                Popular
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Pro</h2>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">$19</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Unlimited API calls</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Advanced request builder</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Team collaboration (up to 5)</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>API monitoring</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Code generation</span>
                  </li>
                </ul>
              </div>
              <Button className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700">
                Get Started
              </Button>
            </div>
            {/* Enterprise Plan */}
            <div className="flex flex-col justify-between bg-white border border-gray-200 w-full sm:w-[90%] md:w-[45%] lg:w-[30%] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-6 lg:p-8 m-3 sm:m-4 lg:m-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Enterprise
                </h2>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Advanced security testing</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Custom integrations</span>
                  </li>
                </ul>
              </div>
              <Button className="w-full py-3 bg-gray-800 text-white hover:bg-gray-900">
                Contact Sales
              </Button>
            </div>
          </div>{" "}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to simplify your API testing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust our platform for their API
            testing needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">            <Button 
              className="px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
              onClick={openSignupModal}
            >
              Sign Up Free
            </Button>
            <Button
              variant="outline"
              className="px-8 py-6 bg-blue-700 text-white hover:bg-blue-800 border-white"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">API Testing Tool</h3>
              <p className="text-gray-400 mb-4">
                The most powerful API testing platform for developers and teams.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-twitter"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-github"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-linkedin"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    API Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Tutorials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Legal
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 API Testing Tool. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}