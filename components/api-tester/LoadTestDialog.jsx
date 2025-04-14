import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
    const [authToken, setAuthToken] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const router = useRouter();

    const generateAndSaveK6Script = useMutation(api.k6tests.generateAndSaveK6Script);

    const handleCreateTest = async () => {
        try {
            setIsGenerating(true);
            
            // Generate and save the test with auth data
            const { testId } = await generateAndSaveK6Script({
                name: testName,
                requestId: requestData.id,
                requestData: {
                    method: requestData.method,
                    url: requestData.url,
                    headers: requestData.headers,
                    body: requestData.body,
                    params: requestData.params,
                    authType: authType || undefined,
                    authToken: authToken || undefined
                },
                options: { 
                    vus, 
                    duration 
                }
            });

            onTestCreated?.(testId);
            onOpenChange(false);
            toast.success("Load test created successfully");
            window.location.href = '/loadtests';
            
        } catch (error) {
            console.error("Error creating load test:", error);
            toast.error("Failed to create load test", {
                description: error.message
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
