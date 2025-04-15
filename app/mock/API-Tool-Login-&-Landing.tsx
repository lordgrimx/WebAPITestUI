// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect } from 'react';
const App: React.FC = () => {
const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
const [email, setEmail] = useState<string>('');
const [password, setPassword] = useState<string>('');
const [rememberMe, setRememberMe] = useState<boolean>(false);
const [isLoading, setIsLoading] = useState<boolean>(false);
const handleLogin = (e: React.FormEvent) => {
e.preventDefault();
setIsLoading(true);
// Simulate API login
setTimeout(() => {
setIsLoggedIn(true);
setIsLoading(false);
}, 1500);
};
return (
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
{!isLoggedIn ? (
<div className="min-h-screen flex items-center justify-center p-4">
<div className="relative">
{/* 3D Background Elements */}
<div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-xl rotate-12 animate-float"></div>
<div className="absolute top-40 -right-16 w-32 h-32 bg-cyan-500/10 rounded-xl -rotate-12 animate-float-delayed"></div>
<div className="absolute -bottom-16 -left-10 w-24 h-24 bg-indigo-500/10 rounded-xl rotate-45 animate-float-slow"></div>
{/* Login Card */}
<div className="w-full max-w-md backdrop-blur-lg bg-white/90 rounded-xl shadow-xl overflow-hidden z-10 relative">
<div className="p-8">
<div className="text-center mb-8">
<h1 className="text-2xl font-bold text-[#1A2333]">API Testing Tool</h1>
<p className="text-gray-500 mt-2">Sign in to access your workspace</p>
</div>
<form onSubmit={handleLogin}>
<div className="space-y-5">
<div className="relative">
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
<div className="relative">
<input
id="email"
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all duration-200"
placeholder="your@email.com"
required
/>
<i className="fa fa-envelope absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
</div>
</div>
<div className="relative">
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
<div className="relative">
<input
id="password"
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all duration-200"
placeholder="••••••••"
required
/>
<i className="fa fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
</div>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center">
<input
id="remember-me"
type="checkbox"
checked={rememberMe}
onChange={() => setRememberMe(!rememberMe)}
className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
/>
<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
Remember me
</label>
</div>
<a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
Forgot password?
</a>
</div>
<button
type="submit"
className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 !rounded-button whitespace-nowrap cursor-pointer"
disabled={isLoading}
>
{isLoading ? (
<span className="flex items-center justify-center">
<i className="fa fa-circle-notch fa-spin mr-2"></i>
Signing in...
</span>
) : (
'Sign in'
)}
</button>
</div>
</form>
<div className="mt-6 text-center">
<p className="text-sm text-gray-600">
Don't have an account?{' '}
<a href="https://readdy.ai/home/cb224061-3f7c-41e1-b42e-f6abc48d7ed3/83c09051-82ff-4441-a74d-ed9e3c6bf77b" data-readdy="true" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
Sign up
</a>
</p>
</div>
</div>
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
) : (
<div className="min-h-screen flex flex-col">
{/* Header */}
<header className="bg-white border-b border-gray-200">
<div className="flex items-center justify-between px-4 py-2">
<div className="flex items-center">
<h1 className="text-xl font-bold text-[#1A2333] mr-6">API Testing Tool</h1>
<div className="hidden md:flex space-x-2">
<button className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded !rounded-button whitespace-nowrap cursor-pointer">
<i className="fa fa-save mr-1.5"></i>
Save
</button>
<button className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded !rounded-button whitespace-nowrap cursor-pointer">
<i className="fa fa-code mr-1.5"></i>
Generate Code
</button>
<button className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded !rounded-button whitespace-nowrap cursor-pointer">
<i className="fa fa-cog mr-1.5"></i>
Settings
</button>
</div>
</div>
<div className="flex items-center space-x-3">
<div className="relative">
<button className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded !rounded-button whitespace-nowrap cursor-pointer">
<i className="fa fa-globe mr-1.5"></i>
Environment
<i className="fa fa-chevron-down ml-1.5 text-xs"></i>
</button>
</div>
<div className="relative">
<button className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded !rounded-button whitespace-nowrap cursor-pointer">
<i className="fa fa-share-alt mr-1.5"></i>
Share
<i className="fa fa-chevron-down ml-1.5 text-xs"></i>
</button>
</div>
<button className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer">
<i className="fa fa-moon"></i>
</button>
<div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
JD
</div>
</div>
</div>
</header>
{/* Main Content */}
<div className="flex flex-1 overflow-hidden">
{/* Sidebar */}
<div className="w-64 bg-white border-r border-gray-200 flex flex-col">
<div className="p-3 border-b border-gray-200">
<div className="relative">
<input
type="text"
placeholder="Search collections..."
className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
/>
<i className="fa fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
</div>
<button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center !rounded-button whitespace-nowrap cursor-pointer">
<i className="fa fa-plus mr-1.5"></i>
New Collection
</button>
</div>
<div className="flex-1 overflow-y-auto">
<div className="p-3">
<h3 className="text-xs font-semibold text-gray-500 mb-2">COLLECTIONS</h3>
<div className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded cursor-pointer">
<div className="flex items-center">
<i className="fa fa-folder text-gray-400 mr-2"></i>
<span className="text-sm">Test</span>
</div>
<div className="flex items-center">
<button className="text-gray-400 hover:text-gray-600">
<i className="fa fa-trash"></i>
</button>
<button className="text-gray-400 hover:text-gray-600 ml-2">
<i className="fa fa-chevron-down text-xs"></i>
</button>
</div>
</div>
</div>
<div className="p-3 border-t border-gray-200">
<h3 className="text-xs font-semibold text-gray-500 mb-2">HISTORY</h3>
<div className="space-y-1">
<div className="flex items-center justify-between py-1.5 px-2 bg-blue-50 rounded text-sm">
<div className="flex items-center">
<span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">GET</span>
<span className="text-sm text-gray-700">/users</span>
</div>
<span className="text-xs text-gray-500">just now</span>
</div>
<div className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-100 rounded text-sm cursor-pointer">
<div className="flex items-center">
<span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">GET</span>
<span className="text-sm text-gray-700">/users</span>
</div>
<span className="text-xs text-gray-500">7m ago</span>
</div>
<div className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-100 rounded text-sm cursor-pointer">
<div className="flex items-center">
<span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">GET</span>
<span className="text-sm text-gray-700">/users</span>
</div>
<span className="text-xs text-gray-500">10m ago</span>
</div>
<div className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-100 rounded text-sm cursor-pointer">
<div className="flex items-center">
<span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">GET</span>
<span className="text-sm text-gray-700">/users</span>
</div>
<span className="text-xs text-gray-500">11m ago</span>
</div>
</div>
</div>
</div>
<div className="p-3 border-t border-gray-200">
<button className="flex items-center justify-center w-full py-2 px-3 bg-red-100 text-red-800 rounded-lg !rounded-button whitespace-nowrap cursor-pointer">
<span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">N</span>
<span className="font-medium">3 issues</span>
<i className="fa fa-times ml-2"></i>
</button>
</div>
</div>
{/* Main Workspace */}
<div className="flex-1 flex flex-col overflow-hidden">
{/* Request Section */}
<div className="p-4 bg-white border-b border-gray-200">
<div className="flex items-center space-x-2">
<div className="w-24">
<div className="relative">
<select className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
<option>GET</option>
<option>POST</option>
<option>PUT</option>
<option>DELETE</option>
<option>PATCH</option>
</select>
<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
<i className="fa fa-chevron-down text-xs"></i>
</div>
</div>
</div>
<div className="flex-1">
<input
type="text"
value="https://jsonplaceholder.typicode.com/users"
className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none"
/>
</div>
<button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center !rounded-button whitespace-nowrap cursor-pointer">
<i className="fa fa-paper-plane mr-1.5"></i>
Send
</button>
</div>
<div className="mt-4">
<div className="border-b border-gray-200">
<nav className="flex -mb-px">
<a href="#" className="py-2 px-4 border-b-2 border-blue-500 text-blue-600 text-sm font-medium">
Params
</a>
<a href="#" className="py-2 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm font-medium">
Headers
</a>
<a href="#" className="py-2 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm font-medium">
Body
</a>
<a href="#" className="py-2 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm font-medium">
Auth
</a>
<a href="#" className="py-2 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm font-medium">
Tests
</a>
</nav>
</div>
<div className="mt-3">
<div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 mb-1 px-2">
<div className="col-span-1"></div>
<div className="col-span-5">KEY</div>
<div className="col-span-5">VALUE</div>
<div className="col-span-1"></div>
</div>
<div className="grid grid-cols-12 gap-2 mb-2">
<div className="col-span-1 flex items-center justify-center">
<input type="checkbox" checked className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer" />
</div>
<div className="col-span-5">
<input
type="text"
value="limit"
className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
/>
</div>
<div className="col-span-5">
<input
type="text"
value="10"
className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
/>
</div>
<div className="col-span-1 flex items-center justify-center">
<button className="text-gray-400 hover:text-gray-600">
<i className="fa fa-trash"></i>
</button>
</div>
</div>
<div className="grid grid-cols-12 gap-2">
<div className="col-span-1 flex items-center justify-center">
<input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer" />
</div>
<div className="col-span-5">
<input
type="text"
placeholder="Key"
className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
/>
</div>
<div className="col-span-5">
<input
type="text"
placeholder="Value"
className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
/>
</div>
<div className="col-span-1 flex items-center justify-center">
<button className="text-gray-400 hover:text-gray-600">
<i className="fa fa-trash"></i>
</button>
</div>
</div>
<button className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center cursor-pointer">
<i className="fa fa-plus mr-1.5"></i>
Add Param
</button>
</div>
</div>
</div>
{/* Response Section */}
<div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
<div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
<div className="flex items-center">
<span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
Response 200
</span>
<span className="text-gray-500 text-sm ml-3">483 ms, 4.00 KB</span>
</div>
<div className="flex">
<button className="px-3 py-1 text-sm font-medium text-gray-700 border-b-2 border-blue-500">
Pretty
</button>
<button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700">
Raw
</button>
<button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700">
Preview
</button>
<button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700">
Headers
</button>
</div>
</div>
<div className="flex-1 overflow-auto p-4 font-mono text-sm">
<pre className="text-gray-800">
{`[
{
"id": 1,
"name": "Leanne Graham",
"username": "Bret",
"email": "sincere@april.biz",
"address": {
"street": "Kulas Light",
"suite": "Apt. 556",
"city": "Gwenborough",
"zipcode": "92998-3874",
"geo": {
"lat": "-37.3159",
"lng": "81.1496"
}
},
"phone": "1-770-736-8031 x56442",
"website": "hildegard.org",
"company": {
"name": "Romaguera-Crona",
"catchPhrase": "Multi-layered client-server neural-net",
"bs": "harness real-time e-markets"
}
},
{
"id": 2,
"name": "Ervin Howell",
"username": "Antonette",
...
}
]`}
</pre>
</div>
</div>
</div>
</div>
</div>
)}
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
export default App
