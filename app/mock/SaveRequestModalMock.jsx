showSaveModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Save Request</h3>
          <button
            onClick={() => setShowSaveModal(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none whitespace-nowrap !rounded-button"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Request Name
              </label>
              <input
                type="text"
                placeholder="e.g. Get User List"
                className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description (optional)
              </label>
              <textarea
                placeholder="Add a description for this request"
                rows={3}
                className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Collection
              </label>
              <div className="relative">
                <select
                  className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none}
                >
                  <option value="">Select a collection</option>
                  <option value="user-api">User API</option>
                  <option value="product-api">Product API</option>
                  <option value="new">+ Create new collection</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <i className="fas fa-chevron-down text-gray-400"></i>
                </div>
              </div>
            </div>
            <div className="hidden">
              <label className="block text-sm font-medium mb-1">
                New Collection Name
              </label>
              <input
                type="text"
                placeholder="e.g. Authentication API"
                className={w-full px-3 py-2 border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent}
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">Add to favorites</span>
              </label>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={() => setShowSaveModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent whitespace-nowrap !rounded-button"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Logic to save the request
              setShowSaveModal(false);
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap !rounded-button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
      )}