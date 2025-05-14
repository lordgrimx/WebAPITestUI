import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { authAxios } from '@/lib/auth-context';
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
import { Dialog as ModalDialog } from "@/components/ui/dialog"; // Rename to avoid conflict
import { useAuth } from '@/lib/auth-context'; // Import useAuth

export default function LoadTestDialog({ 
    open, 
    onOpenChange, 
    requestData,
    onTestCreated 
}) {
    const [testName, setTestName] = useState("");
    const [vus, setVus] = useState(1);
    const [duration, setDuration] = useState("30s");
    const [authType, setAuthType] = useState("");
    const [authToken, setAuthToken] = useState("");
    const [idList, setIdList] = useState(""); // Yeni alan
    const [parameters, setParameters] = useState(""); // Yeni alan
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isParameterModalOpen, setIsParameterModalOpen] = useState(false);
    const [tempParameters, setTempParameters] = useState("");
    const router = useRouter();
    const { userId } = useAuth(); // Get userId from useAuth

    const handleParametersSave = () => {
        try {
            // Validate and format JSON
            const parsed = JSON.parse(tempParameters);
            const formatted = JSON.stringify(parsed, null, 2);
            setParameters(formatted);
            setIsParameterModalOpen(false);
        } catch (error) {
            toast.error("Invalid JSON format");
        }
    };

    // Backend API'yi kullanarak k6 test scripti oluşturma
    const handleCreateTest = async () => {
        try {
            setIsGenerating(true);

            // Validate and parse parameters
            let parsedParameters = {};
            if (parameters) {
                try {
                    parsedParameters = JSON.parse(parameters);
                    // Validate that each parameter is an array
                    for (const [key, value] of Object.entries(parsedParameters)) {
                        if (!Array.isArray(value)) {
                            toast.error(`Parameter "${key}" must be an array of values`);
                            return;
                        }
                    }
                } catch (error) {
                    toast.error("Invalid JSON parameters format");
                    return;
                }
            }
            
            const requestBody = {
                requestData: {
                    method: requestData.method,
                    url: requestData.url,
                    headers: requestData.headers || "{}",
                    body: requestData.body || "",
                    params: requestData.params || "",
                    authType: authType || "",
                    authToken: authToken || "",
                    id: idList || "", // ID listesini ekle
                    parameters: JSON.stringify(parsedParameters) // Add parameters to request
                },
                options: {
                    vus: parseInt(vus),
                    duration: duration
                },
                environmentId: localStorage.getItem('currentEnvironmentId') || null, // Get environmentId from localStorage
                userId: userId // Add userId
            };

            console.log('Request Body:', JSON.stringify(requestBody, null, 2));
            // Log values just before sending
            console.log('UserId to be sent:', userId);
            console.log('EnvironmentId from localStorage to be sent:', localStorage.getItem('currentEnvironmentId'));
            
            // Query parametrelerini URL'e ekleyerek API çağrısı yapma
            const response = await authAxios.post(
                `/K6Test/generate-and-save?name=${encodeURIComponent(testName)}&description=`,
                requestBody
            );

            const testId = response.data.id;
            
            onTestCreated?.(testId);
            onOpenChange(false);
            toast.success("Yük testi başarıyla oluşturuldu");
            router.push('/loadtests');
            
        } catch (error) {
            console.error("Yük testi oluşturulurken hata:", error);
            console.error("Hata detayları:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data
                }
            });
            
            toast.error("Yük testi oluşturulamadı", {
                description: error.response?.data?.message || error.response?.data || error.message
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Load Test</DialogTitle>
                    <DialogDescription>
                        Configure your K6 load test parameters
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="testName">Test Name</Label>
                        <Input
                            id="testName"
                            value={testName}
                            onChange={(e) => setTestName(e.target.value)}
                            placeholder="My Load Test"
                        />
                    </div>

                    {/* Add auth type selection */}
                    <div className="space-y-2">
                        <Label>Authentication Type</Label>
                        <Select value={authType} onValueChange={setAuthType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select auth type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="bearer">Bearer Token</SelectItem>
                                <SelectItem value="basic">Basic Auth</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Show auth token input if auth type is selected and not none */}
                    {authType && authType !== 'none' && (
                        <div className="space-y-2">
                            <Label htmlFor="authToken">
                                {authType === 'bearer' ? 'Bearer Token' : 'Basic Auth Token'}
                            </Label>
                            <Input
                                id="authToken"
                                value={authToken}
                                onChange={(e) => setAuthToken(e.target.value)}
                                placeholder={
                                    authType === 'bearer' 
                                        ? 'Enter your bearer token'
                                        : 'Enter base64 encoded credentials'
                                }
                                type={authType === 'bearer' ? 'text' : 'password'}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="vus">Virtual Users</Label>
                        <Input
                            id="vus"
                            type="number"
                            min="1"
                            max="100"
                            value={vus}
                            onChange={(e) => setVus(Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="30s"
                        />
                        <p className="text-sm text-gray-500">
                            Format: 30s, 1m, 1h, etc.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="parameters">Dynamic Parameters</Label>
                        <div className="flex gap-2">
                            <Input
                                id="parameters"
                                value={parameters}
                                readOnly
                                placeholder='Click "Edit Parameters" to add dynamic values'
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setTempParameters(parameters || "");
                                    setIsParameterModalOpen(true);
                                }}
                            >
                                Edit Parameters
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                            Provide parameters as JSON. Use {"{{paramName}}"} in URL or body to replace values.
                            Example: /api/users/{"{{id}}"} with {"{\"ids\": [\"1\", \"2\", \"3\"]}"} will test with each ID.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateTest}
                        disabled={isGenerating || isExecuting || !testName || !vus || !duration}
                    >
                        {isGenerating ? 'Creating...' : isExecuting ? 'Executing...' : 'Create & Run Test'}
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Add Parameter Edit Modal */}
            <ModalDialog open={isParameterModalOpen} onOpenChange={setIsParameterModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Dynamic Parameters</DialogTitle>
                        <DialogDescription>
                            Enter your parameters in JSON format. Each parameter should be an array of values.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <textarea
                            value={tempParameters}
                            onChange={(e) => setTempParameters(e.target.value)}
                            className="w-full h-[300px] font-mono text-sm p-4 rounded-md border"
                            placeholder={`{
  "id": ["1", "2", "3"],
  "status": ["active", "pending"],
  "department": ["IT", "HR", "Sales"]
}`}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsParameterModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleParametersSave}>
                            Save Parameters
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </ModalDialog>
        </Dialog>
    );
}
