"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { X, Copy } from "lucide-react";

export default function GenerateCodeModal({ 
  open, 
  setOpen, 
  darkMode, 
  selectedMethod = "GET",
  url = "https://api.example.com/v1/users",
  parameterRows = []
}) {
  const [activeTab, setActiveTab] = useState("javascript");
  
  const languageTabs = [
    "JavaScript",
    "Python",
    "Java",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "cURL"
  ];
  
  const copyToClipboard = () => {
    const codeElement = document.querySelector(`[data-code="${activeTab}"]`);
    if (codeElement) {
      navigator.clipboard.writeText(codeElement.textContent || "");
    }
  };
  
  // Function to generate URL with query params
  const getFullUrl = () => {
    if (!parameterRows || parameterRows.filter(row => row.checked && row.key.trim() !== "").length === 0) {
      return url;
    }
    
    const queryString = parameterRows
      .filter(row => row.checked && row.key.trim() !== "")
      .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
      .join("&");
      
    return `${url}${queryString ? '?' + queryString : ''}`;
  };
  
  const fullUrl = getFullUrl();
  
  // Code snippets for different languages
  const codeSnippets = {
    javascript: `// Using Fetch API
const options = {
  method: '${selectedMethod}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }${selectedMethod !== "GET" && selectedMethod !== "DELETE" ? `,
  body: JSON.stringify({
    example: 'data'
  })` : ""}
};

fetch('${fullUrl}', options)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,

    python: `import requests

url = "${fullUrl}"
headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
${selectedMethod !== "GET" && selectedMethod !== "DELETE" ? 
`payload = {
  "example": "data"
}
response = requests.${selectedMethod.toLowerCase()}(url, json=payload, headers=headers)` : 
`response = requests.${selectedMethod.toLowerCase()}(url, headers=headers)`}

data = response.json()
print(data)`,

    java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class ApiRequest {
  public static void main(String[] args) {
    HttpClient client = HttpClient.newBuilder()
      .version(HttpClient.Version.HTTP_2)
      .connectTimeout(Duration.ofSeconds(10))
      .build();
    
    HttpRequest request = HttpRequest.newBuilder()
      .uri(URI.create("${fullUrl}"))
      .header("Content-Type", "application/json")
      .header("Authorization", "Bearer YOUR_TOKEN_HERE")${selectedMethod !== "GET" && selectedMethod !== "DELETE" ? 
      `\n      .${selectedMethod === "POST" ? "POST" : selectedMethod === "PUT" ? "PUT" : `method("${selectedMethod}",`} (HttpRequest.BodyPublishers.ofString("{\\"example\\": \\"data\\"}"))` : 
      `\n      .${selectedMethod === "GET" ? "GET" : selectedMethod === "DELETE" ? "DELETE" : `method("${selectedMethod}",`} (HttpRequest.BodyPublishers.noBody())`}
      .build();
    
    try {
      HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
      System.out.println(response.statusCode());
      System.out.println(response.body());
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}`,

    "c#": `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

class Program
{
  static async Task Main(string[] args)
  {
    using (HttpClient client = new HttpClient())
    {
      client.DefaultRequestHeaders.Add("Authorization", "Bearer YOUR_TOKEN_HERE");

      ${selectedMethod !== "GET" && selectedMethod !== "DELETE" ? 
      `var content = new StringContent(
        JsonConvert.SerializeObject(new { example = "data" }),
        Encoding.UTF8,
        "application/json"
      );

      HttpResponseMessage response = await client.${selectedMethod === "POST" ? "PostAsync" : selectedMethod === "PUT" ? "PutAsync" : selectedMethod === "PATCH" ? "PatchAsync" : `${selectedMethod}Async`}(
        "${fullUrl}",
        content
      );` : 
      `HttpResponseMessage response = await client.${selectedMethod === "GET" ? "GetAsync" : selectedMethod === "DELETE" ? "DeleteAsync" : `${selectedMethod}Async`}(
        "${fullUrl}"
      );`}

      string responseBody = await response.Content.ReadAsStringAsync();
      Console.WriteLine(responseBody);
    }
  }
}`,

    php: `<?php
$url = '${fullUrl}';

$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL => $url,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => '${selectedMethod}',
  CURLOPT_HTTPHEADER => [
    'Content-Type: application/json',
    'Authorization: Bearer YOUR_TOKEN_HERE'
  ]${selectedMethod !== "GET" && selectedMethod !== "DELETE" ? `,
  CURLOPT_POSTFIELDS => json_encode([
    'example' => 'data'
  ])` : ""}
]);

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
?>`,

    ruby: `require 'uri'
require 'net/http'
require 'json'

uri = URI('${fullUrl}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = (uri.scheme == 'https')

request = Net::HTTP::${selectedMethod === "GET" ? "Get" : selectedMethod === "POST" ? "Post" : selectedMethod === "PUT" ? "Put" : selectedMethod === "DELETE" ? "Delete" : selectedMethod === "PATCH" ? "Patch" : selectedMethod}.new(uri)
request['Content-Type'] = 'application/json'
request['Authorization'] = 'Bearer YOUR_TOKEN_HERE'
${selectedMethod !== "GET" && selectedMethod !== "DELETE" ? `request.body = { example: 'data' }.to_json` : ""}

response = http.request(request)
puts response.body`,

    go: `package main

import (
  "fmt"
  "io/ioutil"
  "net/http"
  ${selectedMethod !== "GET" && selectedMethod !== "DELETE" ? `"strings"` : ""}
)

func main() {
  url := "${fullUrl}"
  method := "${selectedMethod}"
  ${selectedMethod !== "GET" && selectedMethod !== "DELETE" ? 
  `payload := strings.NewReader(\`{"example": "data"}\`)
  req, err := http.NewRequest(method, url, payload)` : 
  `req, err := http.NewRequest(method, url, nil)`}

  if err != nil {
    fmt.Println(err)
    return
  }

  req.Header.Add("Content-Type", "application/json")
  req.Header.Add("Authorization", "Bearer YOUR_TOKEN_HERE")

  client := &http.Client{}
  resp, err := client.Do(req)
  if err != nil {
    fmt.Println(err)
    return
  }
  defer resp.Body.Close()

  body, err := ioutil.ReadAll(resp.Body)
  if err != nil {
    fmt.Println(err)
    return
  }
  fmt.Println(string(body))
}`,

    curl: `curl --location --request ${selectedMethod} '${fullUrl}' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer YOUR_TOKEN_HERE'${selectedMethod !== "GET" && selectedMethod !== "DELETE" ? ` \\
--data-raw '{
  "example": "data"
}'` : ""}`
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={`min-w-3xl max-h-[90vh] overflow-hidden flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold">Generate Code</DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <Tabs 
            defaultValue="javascript" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="border-b flex-wrap rounded-none justify-start mb-4 bg-transparent">
              {languageTabs.map((lang) => (
                <TabsTrigger 
                  key={lang} 
                  value={lang.toLowerCase()}
                  className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
                >
                  {lang}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(codeSnippets).map(([lang, code]) => (
              <TabsContent key={lang} value={lang} className="mt-4">
                <div
                  className={`${
                    darkMode ? "bg-gray-900" : "bg-gray-800"
                  } rounded-md p-4 text-white font-mono text-sm overflow-auto`}
                >
                  <pre 
                    className="whitespace-pre-wrap" 
                    data-code={lang}
                  >
                    {code}
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <Button 
            onClick={copyToClipboard}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Copy className="h-4 w-4 mr-2" /> Copy to Clipboard
          </Button>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
