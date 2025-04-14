import { NextResponse } from 'next/server';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function POST(request) {
  try {
    const { originalRequest, proxySettings } = await request.json();

    if (!originalRequest || !proxySettings || !proxySettings.url) {
      return NextResponse.json({ error: 'Missing original request or proxy settings' }, { status: 400 });
    }

    const { method, url, headers, params, body } = originalRequest;
    const { url: proxyUrl, username, password } = proxySettings;

    console.log(`Proxying request: ${method} ${url} via ${proxyUrl}`);

    // Configure the HttpsProxyAgent
    const agentConfig = {
        host: new URL(proxyUrl).hostname,
        port: new URL(proxyUrl).port || (proxyUrl.startsWith('https') ? 443 : 80), // Default port based on protocol
        protocol: new URL(proxyUrl).protocol,
    };

    // Add proxy authentication if provided
    if (username && password) {
      agentConfig.auth = `${username}:${password}`;
    }

    const httpsAgent = new HttpsProxyAgent(agentConfig);


    // Prepare the axios config for the target API via proxy
    const axiosConfig = {
      method: method,
      url: url,
      headers: headers || {},
      params: params || {},
      data: body,
      httpsAgent: httpsAgent, // Use the proxy agent for HTTPS requests
      // For HTTP requests, you might need a different agent or handle separately
      // httpAgent: httpAgent, // If you need to support HTTP proxies too
      timeout: originalRequest.timeout || 30000, // Use timeout from original request or default
      // Important: Prevent Axios from throwing on non-2xx status codes
      // so we can forward the actual response from the target API
      validateStatus: function (status) {
        return status >= 100 && status < 600; // Accept all status codes
      },
    };

    // Remove 'host' header if present, as it can cause issues with proxies
    delete axiosConfig.headers['host'];
    // Remove content-length header, axios will calculate it
    delete axiosConfig.headers['content-length'];


    // Make the request to the target API through the proxy
    const response = await axios(axiosConfig);

    // Return the response from the target API back to the client
    // Ensure headers are serializable (plain object)
    const responseHeaders = {};
    for (const key in response.headers) {
      if (Object.hasOwnProperty.call(response.headers, key)) {
        responseHeaders[key] = response.headers[key];
      }
    }

    return new NextResponse(JSON.stringify(response.data), {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Proxy route error:', error);

    // Handle different types of errors
    if (error.response) {
      // Error response from the target API (forwarded)
       const responseHeaders = {};
       for (const key in error.response.headers) {
         if (Object.hasOwnProperty.call(error.response.headers, key)) {
           responseHeaders[key] = error.response.headers[key];
         }
       }
      return new NextResponse(JSON.stringify(error.response.data), {
        status: error.response.status,
        headers: responseHeaders,
      });
    } else if (error.request) {
      // Request was made but no response received (network error to target API or proxy issue)
      return NextResponse.json({ error: 'Proxy request failed: No response received from target or proxy', details: error.message }, { status: 502 }); // Bad Gateway
    } else {
      // Setup error or other issues
      return NextResponse.json({ error: 'Proxy internal server error', details: error.message }, { status: 500 });
    }
  }
}
