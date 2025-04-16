import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { authAxios } from '@/lib/auth-context';
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';

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
    const [authToken, setAuthToken] = useState("");    const [isGenerating, setIsGenerating] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const router = useRouter();

    // Backend API'yi kullanarak k6 test scripti oluşturma
    const handleCreateTest = async () => {
        try {
            setIsGenerating(true);
            
            const requestBody = {
                requestData: {
                    method: requestData.method,
                    url: requestData.url,
                    headers: requestData.headers || "{}",
                    body: requestData.body || "",
                    params: requestData.params || "",
                    authType: authType || "",
                    authToken: authToken || ""
                },
                options: {
                    vus: parseInt(vus),
                    duration: duration
                }
            };

            console.log('Request Body:', JSON.stringify(requestBody, null, 2));
            
            // Query parametrelerini URL'e ekleyerek API çağrısı yapma
            const response = await authAxios.post(
                `/K6Test/generate-and-save?name=${encodeURIComponent(testName)}&description=&requestId=${requestData.id || ''}`,
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
        </Dialog>
    );
}
