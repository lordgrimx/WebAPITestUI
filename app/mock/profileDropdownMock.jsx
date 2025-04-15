{showProfileMenu && (
    <div
      className={absolute right-0 top-full mt-2 w-56 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-md shadow-lg border overflow-hidden z-50}
    >
      <div className="py-3 px-4 border-b border-gray-200 flex items-center">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
          JD
        </div>
        <div>
          <div className="font-medium">John Doe</div>
          <div className="text-xs text-gray-500">
            john.doe@example.com
          </div>
        </div>
      </div>
      <div className="py-1">
        <a
          href="#"
          className={flex items-center px-4 py-2 text-sm ${darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-700"}}
        >
          <i className="fas fa-user mr-3 w-5 text-center"></i>
          My Profile
        </a>
        <a
          href="#"
          className={flex items-center px-4 py-2 text-sm ${darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-700"}}
        >
          <i className="fas fa-cog mr-3 w-5 text-center"></i>
          Account Settings
        </a>
        <a
          href="#"
          className={flex items-center px-4 py-2 text-sm ${darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-700"}}
        >
          <i className="fas fa-key mr-3 w-5 text-center"></i>
          API Keys
        </a>
        <a
          href="#"
          className={flex items-center px-4 py-2 text-sm ${darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-700"}}
        >
          <i className="fas fa-bell mr-3 w-5 text-center"></i>
          Notifications
        </a>
        <a
          href="#"
          className={flex items-center px-4 py-2 text-sm ${darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-700"}}
        >
          <i className="fas fa-question-circle mr-3 w-5 text-center"></i>
          Help & Support
        </a>
      </div>
      <div className="border-t border-gray-200 py-1">
        <a
          href="#"
          className={flex items-center px-4 py-2 text-sm ${darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-700"}}
        >
          <i className="fas fa-sign-out-alt mr-3 w-5 text-center"></i>
          Logout
        </a>
      </div>
    </div>
  )}