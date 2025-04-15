import React, { useState } from 'react';

const App: React.FC = () => {
  // State for HTTP method selection
  const [httpMethod, setHttpMethod] = useState<string>('GET');
  
  // State for URL input
  const [url, setUrl] = useState<string>('https://api.example.com/v1/users');
  
  // State for request tabs
  const [activeRequestTab, setActiveRequestTab] = useState<string>('Params');
  
  // State for response tabs
  const [activeResponseTab, setActiveResponseTab] = useState<string>('Pretty');
  
  // State for params
  const [params, setParams] = useState<Array<{key: string, value: string, enabled: boolean}>>([
    { key: 'limit', value: '10', enabled: true },
    { key: '', value: '', enabled: true }
  ]);
  
  // State for headers
  const [headers, setHeaders] = useState<Array<{key: string, value: string, enabled: boolean}>>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: '', value: '', enabled: true }
  ]);
  
  // State for body
  const [requestBody, setRequestBody] = useState<string>('{\n  "name": "John Doe",\n  "email": "john@example.com"\n}');
  
  // State for response
  const [response, setResponse] = useState<{
    status: number | null,
    time: string | null,
    size: string | null,
    body: string | null,
    headers: Record<string, string> | null
  }>({
    status: 200,
    time: '123 ms',
    size: '1.2 KB',
    body: '{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com",\n  "created_at": "2025-04-07T10:30:45Z"\n}',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': 'a1b2c3d4-e5f6-7890',
      'Cache-Control': 'no-cache'
    }
  });
  
  // State for collections
  const [collections, setCollections] = useState<Array<{
    name: string,
    expanded: boolean,
    requests: Array<{name: string, method: string}>
  }>>([
    {
      name: 'User API',
      expanded: true,
      requests: [
        { name: 'Get All Users', method: 'GET' },
        { name: 'Create User', method: 'POST' },
        { name: 'Update User', method: 'PUT' }
      ]
    },
    {
      name: 'Product API',
      expanded: false,
      requests: [
        { name: 'Get Products', method: 'GET' },
        { name: 'Add Product', method: 'POST' }
      ]
    }
  ]);
  
  // State for history
  const [history, setHistory] = useState<Array<{
    method: string,
    url: string,
    time: string
  }>>([
    { method: 'GET', url: 'https://api.example.com/v1/users', time: '10:15 AM' },
    { method: 'POST', url: 'https://api.example.com/v1/users', time: '10:05 AM' },
    { method: 'GET', url: 'https://api.example.com/v1/products', time: '09:58 AM' }
  ]);
  
  // Function to handle sending request
  const handleSendRequest = () => {
    // In a real app, this would make an actual API call
    console.log('Sending request...');
    // Simulate response delay
    setTimeout(() => {
      // Update response state with new data
      setResponse({
        status: 200,
        time: '123 ms',
        size: '1.2 KB',
        body: '{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com",\n  "created_at": "2025-04-07T10:30:45Z"\n}',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': 'a1b2c3d4-e5f6-7890',
          'Cache-Control': 'no-cache'
        }
      });
    }, 500);
  };
  
  // Function to add a new param row
  const addParamRow = () => {
    setParams([...params, { key: '', value: '', enabled: true }]);
  };
  
  // Function to update param
  const updateParam = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newParams = [...params];
    newParams[index][field] = value as never;
    setParams(newParams);
    
    // Add a new empty row if the last row has data
    if (index === params.length - 1 && newParams[index].key !== '') {
      addParamRow();
    }
  };
  
  // Function to add a new header row
  const addHeaderRow = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };
  
  // Function to update header
  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value as never;
    setHeaders(newHeaders);
    
    // Add a new empty row if the last row has data
    if (index === headers.length - 1 && newHeaders[index].key !== '') {
      addHeaderRow();
    }
  };
  
  // Method color mapping
  const methodColors: Record<string, string> = {
    GET: 'bg-blue-500',
    POST: 'bg-green-500',
    PUT: 'bg-amber-500',
    DELETE: 'bg-red-500',
    PATCH: 'bg-purple-500'
  };
  
  // Status code color mapping
  const getStatusColor = (status: number | null) => {
    if (!status) return 'bg-gray-500';
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-blue-500';
    if (status >= 400 && status < 500) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-800">API Testing Tool</h1>
          <div className="ml-8 flex space-x-4">
            <button className="text-gray-600 hover:text-gray-800">
              <i className="fas fa-save mr-1"></i> Save
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <i className="fas fa-code mr-1"></i> Generate Code
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <i className="fas fa-cog mr-1"></i> Settings
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="flex items-center text-gray-600 hover:text-gray-800">
              <i className="fas fa-globe mr-1"></i> Environment
              <i className="fas fa-chevron-down ml-1 text-xs"></i>
            </button>
          </div>
          <button className="text-gray-600 hover:text-gray-800">
            <i className="fas fa-moon"></i>
          </button>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            JD
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search collections..."
                className="w-full px-3 py-2 pl-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-sm"></i>
            </div>
            <button className="mt-3 w-full px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 !rounded-button whitespace-nowrap cursor-pointer">
              <i className="fas fa-plus mr-1"></i> New Collection
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                Collections
              </div>
              
              {/* Collections List */}
              <div className="space-y-1">
                {collections.map((collection, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-center px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                      <i className={`fas fa-${collection.expanded ? 'chevron-down' : 'chevron-right'} w-4 text-gray-400`}></i>
                      <i className="fas fa-folder mr-2 text-gray-400"></i>
                      <span>{collection.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{collection.requests.length}</span>
                    </div>
                    
                    {collection.expanded && (
                      <div className="ml-4 pl-2 border-l border-gray-200 mt-1 space-y-1">
                        {collection.requests.map((request, reqIndex) => (
                          <div key={reqIndex} className="flex items-center px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                            <span className={`inline-block w-10 text-xs font-medium text-white ${methodColors[request.method]} rounded px-1.5 py-0.5 text-center mr-2`}>
                              {request.method}
                            </span>
                            <span className="truncate">{request.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                History
              </div>
              
              {/* History List */}
              <div className="space-y-1">
                {history.map((item, index) => (
                  <div key={index} className="flex items-center px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                    <span className={`inline-block w-10 text-xs font-medium text-white ${methodColors[item.method]} rounded px-1.5 py-0.5 text-center mr-2`}>
                      {item.method}
                    </span>
                    <span className="truncate flex-1">{item.url}</span>
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Request Area */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="relative">
                <select
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value)}
                  className={`appearance-none ${methodColors[httpMethod]} text-white font-medium px-3 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 !rounded-button whitespace-nowrap cursor-pointer`}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
                <i className="fas fa-chevron-down absolute right-2 top-3 text-white text-xs"></i>
              </div>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter request URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-l-0"
                />
                <i className="fas fa-globe absolute right-3 top-2.5 text-gray-400"></i>
              </div>
              
              <button 
                onClick={handleSendRequest}
                className="ml-3 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 !rounded-button whitespace-nowrap cursor-pointer"
              >
                Send
              </button>
            </div>
            
            {/* Request Tabs */}
            <div className="flex mt-4 border-b border-gray-200">
              {['Params', 'Headers', 'Body', 'Auth', 'Tests'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRequestTab(tab)}
                  className={`px-4 py-2 text-sm font-medium ${activeRequestTab === tab ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Request Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeRequestTab === 'Params' && (
              <div className="bg-white rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="w-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="w-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {params.map((param, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={param.enabled}
                            onChange={(e) => updateParam(index, 'enabled', e.target.checked)}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={param.key}
                            onChange={(e) => updateParam(index, 'key', e.target.value)}
                            placeholder="Parameter name"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={param.value}
                            onChange={(e) => updateParam(index, 'value', e.target.value)}
                            placeholder="Parameter value"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          {index !== params.length - 1 && (
                            <button className="text-gray-400 hover:text-red-500 cursor-pointer">
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeRequestTab === 'Headers' && (
              <div className="bg-white rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="w-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="w-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {headers.map((header, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={header.enabled}
                            onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={header.key}
                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                            placeholder="Header name"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={header.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                            placeholder="Header value"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          {index !== headers.length - 1 && (
                            <button className="text-gray-400 hover:text-red-500 cursor-pointer">
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeRequestTab === 'Body' && (
              <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="flex space-x-4 text-sm">
                    <label className="flex items-center">
                      <input type="radio" name="bodyType" className="mr-1 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 cursor-pointer" defaultChecked />
                      <span>JSON</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="bodyType" className="mr-1 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 cursor-pointer" />
                      <span>XML</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="bodyType" className="mr-1 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 cursor-pointer" />
                      <span>Form Data</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="bodyType" className="mr-1 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 cursor-pointer" />
                      <span>Raw</span>
                    </label>
                  </div>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full h-64 p-3 text-sm font-mono focus:outline-none border-none"
                  placeholder="Enter request body"
                ></textarea>
              </div>
            )}
            
            {activeRequestTab === 'Auth' && (
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>No Auth</option>
                    <option>Basic Auth</option>
                    <option>Bearer Token</option>
                    <option>OAuth 2.0</option>
                    <option>API Key</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
            
            {activeRequestTab === 'Tests' && (
              <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="flex space-x-2 text-sm">
                    <button className="px-2 py-1 text-gray-600 hover:text-gray-800 cursor-pointer">
                      <i className="fas fa-play mr-1"></i> Run Tests
                    </button>
                    <button className="px-2 py-1 text-gray-600 hover:text-gray-800 cursor-pointer">
                      <i className="fas fa-plus mr-1"></i> Add Test
                    </button>
                  </div>
                </div>
                <textarea
                  className="w-full h-64 p-3 text-sm font-mono focus:outline-none border-none"
                  placeholder="// Write test scripts here
pm.test('Status code is 200', function() {
  pm.response.to.have.status(200);
});"
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Response Area */}
        <div className="w-1/2 border-l border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium">Response</span>
                {response.status && (
                  <span className={`ml-2 inline-block text-xs font-medium text-white ${getStatusColor(response.status)} rounded px-1.5 py-0.5`}>
                    {response.status}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {response.time && <span><i className="fas fa-clock mr-1"></i> {response.time}</span>}
                {response.size && <span><i className="fas fa-database mr-1"></i> {response.size}</span>}
              </div>
            </div>
            
            {/* Response Tabs */}
            <div className="flex mt-4 border-b border-gray-200">
              {['Pretty', 'Raw', 'Preview', 'Headers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveResponseTab(tab)}
                  className={`px-4 py-2 text-sm font-medium ${activeResponseTab === tab ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Response Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeResponseTab === 'Pretty' && response.body && (
              <pre className="p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap">{response.body}</pre>
            )}
            
            {activeResponseTab === 'Raw' && response.body && (
              <pre className="p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap">{response.body}</pre>
            )}
            
            {activeResponseTab === 'Preview' && (
              <div className="p-4 text-sm text-gray-500">
                No preview available for this response type.
              </div>
            )}
            
            {activeResponseTab === 'Headers' && response.headers && (
              <div className="p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Header</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(response.headers).map(([key, value], index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

