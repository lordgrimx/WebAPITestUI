{/* Settings Modal */}
{showSettings && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none whitespace-nowrap !rounded-button"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">General</h4>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Theme
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      checked={!darkMode}
                      onChange={() => setDarkMode(false)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Light</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      checked={darkMode}
                      onChange={() => setDarkMode(true)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Dark</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">System</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Request Timeout (ms)
                </label>
                <input
                  type="number"
                  className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                  defaultValue={30000}
                  min={1000}
                  max={120000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Response Size Limit (MB)
                </label>
                <input
                  type="number"
                  className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                  defaultValue={50}
                  min={1}
                  max={100}
                />
              </div>
            </div>

            {/* Default Headers */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Default Headers</h4>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Header name"
                      defaultValue="Content-Type"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Header value"
                      defaultValue="application/json"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer whitespace-nowrap !rounded-button">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Header name"
                      defaultValue="Authorization"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Header value"
                      defaultValue="Bearer YOUR_TOKEN_HERE"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer whitespace-nowrap !rounded-button">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Header name"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Header value"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer whitespace-nowrap !rounded-button">
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Proxy Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Proxy Settings</h4>

              <div>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">Enable Proxy</span>
                </label>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Proxy URL
                    </label>
                    <input
                      type="text"
                      placeholder="http://proxy.example.com:8080"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Key Management */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">API Key Management</h4>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Key name"
                      defaultValue="Production API Key"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-7">
                    <input
                      type="password"
                      defaultValue="sk_live_example123456789"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer whitespace-nowrap !rounded-button">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Key name"
                      defaultValue="Test API Key"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-7">
                    <input
                      type="password"
                      defaultValue="sk_test_example123456789"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer whitespace-nowrap !rounded-button">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Key name"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-7">
                    <input
                      type="password"
                      placeholder="API key value"
                      className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer whitespace-nowrap !rounded-button">
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Formatting */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Response Formatting</h4>

              <div>
                <label className="block text-sm font-medium mb-1">
                  JSON Indentation
                </label>
                <select
                  className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                  <option value="tab">Tab</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Default Response View
                </label>
                <select
                  className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
                >
                  <option value="pretty">Pretty</option>
                  <option value="raw">Raw</option>
                  <option value="preview">Preview</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">Wrap long lines</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">Highlight syntax</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={() => setShowSettings(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent whitespace-nowrap !rounded-button"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowSettings(false)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap !rounded-button"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
      )}