{showCodeModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Generate Code</h3>
          <button
            onClick={() => setShowCodeModal(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none whitespace-nowrap !rounded-button"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                "JavaScript",
                "Python",
                "Java",
                "C#",
                "PHP",
                "Ruby",
                "Go",
                "cURL",
              ].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeTab(lang.toLowerCase())}
                  className={`py-2 px-4 text-sm font-medium cursor-pointer whitespace-nowrap !rounded-button ${
                    activeCodeTab === lang.toLowerCase()
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-4">
            <div
              className={${darkMode ? "bg-gray-900" : "bg-gray-800"} rounded-md p-4 text-white font-mono text-sm overflow-auto}
            >
              {activeCodeTab === "javascript" && (
                <pre className="whitespace-pre-wrap">
                  {`// Using Fetch API
const options = {
method: '${selectedMethod}',
headers: {
'Content-Type': 'application/json',
'Authorization': 'Bearer YOUR_TOKEN_HERE'
}${
                    selectedMethod !== "GET" && selectedMethod !== "DELETE"
                      ? `,
body: JSON.stringify({
example: 'data'
})`
                      : ""
                  }
};
fetch('${url}${
                    parameterRows.filter(
                      (row) => row.checked && row.key.trim() !== "",
                    ).length > 0
                      ? "?" +
                        parameterRows
                          .filter(
                            (row) => row.checked && row.key.trim() !== "",
                          )
                          .map(
                            (param) =>
                              ${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)},
                          )
                          .join("&")
                      : ""
                  }', options)
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                </pre>
              )}
              {activeCodeTab === "python" && (
                <pre className="whitespace-pre-wrap">
                  {`import requests
url = "${url}${
                    parameterRows.filter(
                      (row) => row.checked && row.key.trim() !== "",
                    ).length > 0
                      ? "?" +
                        parameterRows
                          .filter(
                            (row) => row.checked && row.key.trim() !== "",
                          )
                          .map(
                            (param) =>
                              ${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)},
                          )
                          .join("&")
                      : ""
                  }"
headers = {
"Content-Type": "application/json",
"Authorization": "Bearer YOUR_TOKEN_HERE"
}
${
selectedMethod !== "GET" && selectedMethod !== "DELETE"
? `payload = {
"example": "data"
}
response = requests.${selectedMethod.toLowerCase()}(url, json=payload, headers=headers)`
: response = requests.${selectedMethod.toLowerCase()}(url, headers=headers)
}
data = response.json()
print(data)`}
                </pre>
              )}
              {activeCodeTab === "java" && (
                <pre className="whitespace-pre-wrap">
                  {`import java.net.URI;
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
.uri(URI.create("${url}${
                    parameterRows.filter(
                      (row) => row.checked && row.key.trim() !== "",
                    ).length > 0
                      ? "?" +
                        parameterRows
                          .filter(
                            (row) => row.checked && row.key.trim() !== "",
                          )
                          .map(
                            (param) =>
                              ${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)},
                          )
                          .join("&")
                      : ""
                  }"))
.header("Content-Type", "application/json")
.header("Authorization", "Bearer YOUR_TOKEN_HERE")${
                    selectedMethod !== "GET" && selectedMethod !== "DELETE"
                      ? `
.${selectedMethod === "POST" ? "POST" : selectedMethod === "PUT" ? "PUT" : 'method("' + selectedMethod + '",'} (HttpRequest.BodyPublishers.ofString("{\\"example\\": \\"data\\"}"))`
                      : `
.${selectedMethod === "GET" ? "GET" : selectedMethod === "DELETE" ? "DELETE" : 'method("' + selectedMethod + '",'} (HttpRequest.BodyPublishers.noBody())`
                  }
.build();
try {
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.statusCode());
System.out.println(response.body());
} catch (Exception e) {
e.printStackTrace();
}
}
}`}
                </pre>
              )}
              {activeCodeTab === "c#" && (
                <pre className="whitespace-pre-wrap">
                  {`using System;
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
${
selectedMethod !== "GET" && selectedMethod !== "DELETE"
? `var content = new StringContent(
JsonConvert.SerializeObject(new { example = "data" }),
Encoding.UTF8,
"application/json"
);
HttpResponseMessage response = await client.${selectedMethod === "POST" ? "PostAsync" : selectedMethod === "PUT" ? "PutAsync" : selectedMethod === "PATCH" ? "PatchAsync" : selectedMethod + "Async"}(
"${url}${
    parameterRows.filter((row) => row.checked && row.key.trim() !== "")
      .length > 0
      ? "?" +
        parameterRows
          .filter((row) => row.checked && row.key.trim() !== "")
          .map(
            (param) =>
              ${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)},
          )
          .join("&")
      : ""
  }",
content
);`
: `HttpResponseMessage response = await client.${selectedMethod === "GET" ? "GetAsync" : selectedMethod === "DELETE" ? "DeleteAsync" : selectedMethod + "Async"}(
"${url}${
    parameterRows.filter((row) => row.checked && row.key.trim() !== "")
      .length > 0
      ? "?" +
        parameterRows
          .filter((row) => row.checked && row.key.trim() !== "")
          .map(
            (param) =>
              ${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)},
          )
          .join("&")
      : ""
  }"
);`
}
string responseBody = await response.Content.ReadAsStringAsync();
Console.WriteLine(responseBody);
}
}
}`}
                </pre>
              )}
              {activeCodeTab === "php" && (
                <pre className="whitespace-pre-wrap">
                  {`<?php
$url = '${url}${
                    parameterRows.filter(
                      (row) => row.checked && row.key.trim() !== "",
                    ).length > 0
                      ? "?" +
                        parameterRows
                          .filter(
                            (row) => row.checked && row.key.trim() !== "",
                          )
                          .map(
                            (param) =>
                              ${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)},
                          )
                          .join("&")
                      : ""
                  }';
$curl = curl_init();
curl_setopt_array($curl, [
CURLOPT_URL => $url,
CURLOPT_RETURNTRANSFER => true,
CURLOPT_CUSTOMREQUEST => '${selectedMethod}',
CURLOPT_HTTPHEADER => [
'Content-Type: application/json',
'Authorization: Bearer YOUR_TOKEN_HERE'
]${
                    selectedMethod !== "GET" && selectedMethod !== "DELETE"
                      ? `,
CURLOPT_POSTFIELDS => json_encode([
'example' => 'data'
])`
                      : ""
                  }
]);
$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);
if ($err) {
echo "cURL Error #:" . $err;
} else {
echo $response;
}
?>`}
                </pre>
              )}
              {activeCodeTab === "ruby" && (
                <pre className="whitespace-pre-wrap">
                  {`require 'uri'
require 'net/http'
require 'json'
uri = URI('${url}${
                    parameterRows.filter(
                      (row) => row.checked && row.key.trim() !== "",
                    ).length > 0
                      ? "?" +
                        parameterRows
                          .filter(
                            (row) => row.checked && row.key.trim() !== "",
                          )
                          .map(
                            (param) =>
                              ${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)},
                          )
                          .join("&")
                      : ""
                  }')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = (uri.scheme == 'https')
request = Net::HTTP::${selectedMethod === "GET" ? "Get" : selectedMethod === "POST" ? "Post" : selectedMethod === "PUT" ? "Put" : selectedMethod === "DELETE" ? "Delete" : selectedMethod === "PATCH" ? "Patch" : selectedMethod}.new(uri)
request['Content-Type'] = 'application/json'
request['Authorization'] = 'Bearer YOUR_TOKEN_HERE'
${selectedMethod !== "GET" && selectedMethod !== "DELETE" ? request.body = { example: 'data' }.to_json : ""}
response = http.request(request)
puts response.body`}
                </pre>
              )}
              {activeCodeTab === "go" && (
                <pre className="whitespace-pre-wrap">
                  {`package main
import (
"fmt"
"io/ioutil"
"net/http"
"strings"
)
func main() {
url := "${url}${
                    parameterRows.filter(
                      (row) => row.checked && row.key.trim() !== "",
                    ).length > 0
                      ? "?" +
                        parameterRows
                          .filter(
                            (row) => row.checked && row.key.trim() !== "",
                          )
                          .map(
                            (param) =>
                              ${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)},
                          )
                          .join("&")
                      : ""
                  }"
method := "${selectedMethod}"
${
selectedMethod !== "GET" && selectedMethod !== "DELETE"
? payload := strings.NewReader(\{"example": "data"}\`)
req, err := http.NewRequest(method, url, payload)`
: req, err := http.NewRequest(method, url, nil)
}
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
}`}
                </pre>
              )}
              {activeCodeTab === "curl" && (
                <pre className="whitespace-pre-wrap">
                  {`curl --location --request ${selectedMethod} '${url}${
                    parameterRows.filter(
                      (row) => row.checked && row.key.trim() !== "",
                    ).length > 0
                      ? "?" +
                        parameterRows
                          .filter(
                            (row) => row.checked && row.key.trim() !== "",
                          )
                          .map(
                            (param) =>
                              ${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)},
                          )
                          .join("&")
                      : ""
                  }' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer YOUR_TOKEN_HERE'${
                    selectedMethod !== "GET" && selectedMethod !== "DELETE"
                      ? ` \\
--data-raw '{
"example": "data"
}'`
                      : ""
                  }`}
                </pre>
              )}
            </div>
            <button
              onClick={() => {
                const codeElement = document.querySelector(
                  [data-code="${activeCodeTab}"],
                );
                if (codeElement) {
                  navigator.clipboard.writeText(
                    codeElement.textContent || "",
                  );
                }
              }}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center justify-center text-sm font-medium cursor-pointer whitespace-nowrap !rounded-button"
            >
              <i className="far fa-copy mr-2"></i> Copy to Clipboard
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => setShowCodeModal(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap !rounded-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
      )}