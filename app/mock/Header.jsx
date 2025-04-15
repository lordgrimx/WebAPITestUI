{/* Header */}
<header
className={${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b py-3 px-6 flex items-center justify-between}
>
<div className="flex items-center space-x-2">
  <h1 className="text-xl font-semibold text-gray-800">
    API Testing Tool
  </h1>
  <div className="flex space-x-2 ml-6">
    <button className="text-gray-600 hover:text-gray-800 px-2 py-1 text-sm rounded-md hover:bg-gray-100 cursor-pointer whitespace-nowrap !rounded-button">
      <i className="fas fa-save mr-1"></i> Save
    </button>
    <button className="text-gray-600 hover:text-gray-800 px-2 py-1 text-sm rounded-md hover:bg-gray-100 cursor-pointer whitespace-nowrap !rounded-button">
      <i className="fas fa-code mr-1"></i> Generate Code
    </button>
    <button
      onClick={() => setShowSettings(true)}
      className="text-gray-600 hover:text-gray-800 px-2 py-1 text-sm rounded-md hover:bg-gray-100 cursor-pointer whitespace-nowrap !rounded-button"
    >
      <i className="fas fa-cog mr-1"></i> Settings
    </button>
  </div>
</div>
<div className="flex items-center space-x-4">
  <div className="relative">
    <button className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-1 text-sm rounded-md border border-gray-300 cursor-pointer whitespace-nowrap !rounded-button">
      <i className="fas fa-globe mr-2"></i>
      Environment <i className="fas fa-chevron-down ml-2"></i>
    </button>
    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block">
      <div className="p-2 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-700">
          Environments
        </div>
      </div>
      <div className="p-2">
        <div className="flex items-center justify-between py-1 px-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
          <span className="flex items-center">
            <i className="fas fa-check text-green-500 mr-2"></i>
            Development
          </span>
          <i className="fas fa-pencil-alt text-gray-400 hover:text-gray-600"></i>
        </div>
        <div className="flex items-center justify-between py-1 px-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
          <span>Staging</span>
          <i className="fas fa-pencil-alt text-gray-400 hover:text-gray-600"></i>
        </div>
        <div className="flex items-center justify-between py-1 px-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
          <span>Production</span>
          <i className="fas fa-pencil-alt text-gray-400 hover:text-gray-600"></i>
        </div>
        <button className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded-md flex items-center justify-center text-sm cursor-pointer whitespace-nowrap !rounded-button">
          <i className="fas fa-plus mr-2"></i> Add Environment
        </button>
      </div>
    </div>
  </div>
  <div className="relative">
    <button className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-1 text-sm rounded-md border border-gray-300 cursor-pointer whitespace-nowrap !rounded-button">
      <i className="fas fa-share-alt mr-2"></i>
      Share <i className="fas fa-chevron-down ml-2"></i>
    </button>
  </div>
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="text-gray-600 hover:text-gray-800 cursor-pointer whitespace-nowrap !rounded-button"
  >
    {darkMode ? (
      <i className="fas fa-sun"></i>
    ) : (
      <i className="fas fa-moon"></i>
    )}
  </button>
  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white cursor-pointer">
    JD
  </div>
</div>
      </header>