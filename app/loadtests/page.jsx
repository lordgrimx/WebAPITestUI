"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Clock, 
  Users, 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Timer, 
  Gauge, 
  LineChart,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MetricItem({ label, value }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold">{value?.toFixed(2) || '0.00'}</p>
    </div>
  );
}

export default function LoadTestsPage() {
  const k6Tests = useQuery(api.k6tests.getK6Tests);
  const executeK6Test = useMutation(api.k6tests.executeK6Test);
  const updateK6TestResults = useMutation(api.k6tests.updateK6TestResults);
  const deleteK6Test = useMutation(api.k6tests.deleteK6Test);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isRunning, setIsRunning] = useState({});

  const handleRunTest = async (testId) => {
    try {
      setIsRunning(prev => ({ ...prev, [testId]: true }));
      toast.info("Executing test...", { description: "This may take a moment" });
      
      // Get script from Convex
      const testInfo = await executeK6Test({ testId });
      
      // Execute k6 test via local API
      const response = await fetch('/api/k6/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: testInfo.script,
          testId: testInfo.testId,
          options: testInfo.options
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const results = await response.json();

      // Update test results using mutation
      await updateK6TestResults({
        id: testId,
        status: "completed",
        results: {
          vus: results.vus || 10,
          duration: results.duration || "30s",
          requestsPerSecond: results.requestsPerSecond || 0,
          failureRate: results.failureRate || 0,
          averageResponseTime: results.averageResponseTime || 0,
          p95ResponseTime: results.p95ResponseTime || 0,
          timestamp: Date.now(),
          detailedMetrics: results.detailedMetrics // Add detailed metrics
        }
      });

      toast.success("Test execution completed", {
        description: `RPS: ${results.requestsPerSecond.toFixed(2)}, Failure Rate: ${results.failureRate.toFixed(2)}%`
      });
    } catch (error) {
      console.error("Error running test:", error);
      
      // Update test status to failed with error info
      await updateK6TestResults({
        id: testId,
        status: "failed",
        results: {
          vus: 0,
          duration: "0s",
          requestsPerSecond: 0,
          failureRate: 100,
          averageResponseTime: 0,
          p95ResponseTime: 0,
          timestamp: Date.now()
        }
      });

      toast.error("Failed to run test", { description: error.message });
    } finally {
      setIsRunning(prev => ({ ...prev, [testId]: false }));
    }
  };

  const handleDeleteTest = async (testId) => {
    try {
      await deleteK6Test({ id: testId });
      toast.success("Test deleted successfully");
    } catch (error) {
      toast.error("Failed to delete test");
    }
  };

  const statusIcons = {
    created: <Clock className="h-4 w-4" />,
    pending: <RefreshCw className="h-4 w-4" />,
    running: <Play className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />,
    failed: <AlertTriangle className="h-4 w-4" />
  };

  const statusColors = {
    created: "bg-slate-500 hover:bg-slate-600",
    pending: "bg-amber-500 hover:bg-amber-600",
    running: "bg-blue-500 hover:bg-blue-600",
    completed: "bg-emerald-500 hover:bg-emerald-600",
    failed: "bg-rose-500 hover:bg-rose-600"
  };

  const statusTextColors = {
    created: "text-slate-500",
    pending: "text-amber-500",
    running: "text-blue-500",
    completed: "text-emerald-500",
    failed: "text-rose-500"
  };

  // Calculate performance score (0-100) based on results
  const calculatePerformanceScore = (test) => {
    if (!test.results) return null;
    
    // Lower failure rate is better (0-100)
    const failureScore = Math.max(0, 100 - test.results.failureRate);
    
    // Higher RPS is better (0-100)
    // Assuming 50 RPS is excellent (100 score)
    const rpsScore = Math.min(100, (test.results.requestsPerSecond / 50) * 100);
    
    // Lower response time is better (0-100)
    // Assuming 100ms is excellent (100 score), 1000ms is poor (0 score)
    const respTimeScore = Math.max(0, 100 - ((test.results.averageResponseTime / 10)));
    
    // Weighted average
    return Math.round((failureScore * 0.4) + (rpsScore * 0.3) + (respTimeScore * 0.3));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Load Tests</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Create New Test
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {k6Tests?.map((test) => {
          const performanceScore = calculatePerformanceScore(test);
          
          return (
            <Card key={test._id} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">{test.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {format(test.createdAt, 'PPpp')}
                    </CardDescription>
                  </div>
                  <Badge className={`${statusColors[test.status]} text-white`}>
                    <span className="flex items-center gap-1">
                      {statusIcons[test.status]}
                      {test.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded-lg">
                    <Users className="h-4 w-4 mb-1 text-slate-500" />
                    <span className="text-lg font-medium">{test.results?.vus || 0}</span>
                    <span className="text-xs text-slate-500">Virtual Users</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded-lg">
                    <Timer className="h-4 w-4 mb-1 text-slate-500" />
                    <span className="text-lg font-medium">{test.results?.duration || "N/A"}</span>
                    <span className="text-xs text-slate-500">Duration</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded-lg">
                    <LineChart className="h-4 w-4 mb-1 text-slate-500" />
                    <span className="text-lg font-medium">{test.results?.requestsPerSecond?.toFixed(1) || 0}</span>
                    <span className="text-xs text-slate-500">Req/sec</span>
                  </div>
                </div>
                
                {test.status === 'completed' && performanceScore !== null && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performance Score</span>
                      <span className={`font-semibold ${
                        performanceScore > 80 ? 'text-emerald-500' :
                        performanceScore > 50 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {performanceScore}/100
                      </span>
                    </div>
                    <Progress 
                      value={performanceScore} 
                      className="h-2"
                      indicatorColor={
                        performanceScore > 80 ? 'bg-emerald-500' :
                        performanceScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }
                    />
                  </div>
                )}
                
                {test.status === 'completed' && (
                  <div className="flex justify-between text-sm mb-4">
                    <div className={test.results?.failureRate > 5 ? 'text-rose-500' : 'text-emerald-500'}>
                      <span className="font-medium">{test.results?.failureRate?.toFixed(1)}%</span> Failure Rate
                    </div>
                    <div>
                      <span className="font-medium">{test.results?.averageResponseTime?.toFixed(0)}</span> ms Avg Response
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTest(test)}
                    className="flex-1"
                  >
                    Details
                  </Button>
                  {['created', 'failed', 'completed'].includes(test.status) && (
                    <>
                      <Button
                        onClick={() => handleRunTest(test._id)}
                        disabled={isRunning[test._id]}
                        className={`flex-1 ${
                          isRunning[test._id] 
                            ? 'bg-blue-400' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      >
                        {isRunning[test._id] ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" /> Run Test
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteTest(test._id)}
                        className="bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {test.status === 'running' && !isRunning[test._id] && (
                    <Button
                      disabled
                      className="flex-1 bg-blue-500 text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Running...
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

<Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
  <DialogContent className="max-w-4xl w-full overflow-hidden">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <span>Test Details: {selectedTest?.name}</span>
        <Badge className={`${statusColors[selectedTest?.status || 'created']} text-white`}>
          <span className="flex items-center gap-1">
            {statusIcons[selectedTest?.status]}
            {selectedTest?.status}
          </span>
        </Badge>
      </DialogTitle>
    </DialogHeader>
    
    <div className="mt-4">
      <Tabs defaultValue="results">
        <TabsList className="w-full">
          <TabsTrigger value="results" className="flex-1">Results</TabsTrigger>
          <TabsTrigger value="script" className="flex-1">Script</TabsTrigger>
          <TabsTrigger value="metrics" className="flex-1">Metrics</TabsTrigger>
          <TabsTrigger value="logs" className="flex-1">Logs</TabsTrigger>
        </TabsList>
        
        <div className="h-[500px] overflow-hidden">
          <TabsContent value="results" className="h-full">
            {selectedTest?.results ? (
              <ScrollArea className="h-full pr-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-500">Virtual Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">{selectedTest.results.vus}</span>
                        <span className="ml-2 text-sm text-slate-500">VUs</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-slate-500">Duration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold">{selectedTest.results.duration}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-slate-500">Requests/Second</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold">{selectedTest.results.requestsPerSecond.toFixed(2)}</span>
                            <span className="ml-2 text-sm text-slate-500">req/s</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-slate-500">Failure Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline">
                            <span className={`text-3xl font-bold ${
                              selectedTest.results.failureRate > 5 ? 'text-rose-500' : 'text-emerald-500'
                            }`}>
                              {selectedTest.results.failureRate.toFixed(2)}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-slate-500">Avg Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold">{selectedTest.results.averageResponseTime.toFixed(2)}</span>
                            <span className="ml-2 text-sm text-slate-500">ms</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-slate-500">P95 Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold">{selectedTest.results.p95ResponseTime.toFixed(2)}</span>
                            <span className="ml-2 text-sm text-slate-500">ms</span>
                          </div>
                        </CardContent>
                      </Card>
                  
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Raw Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(selectedTest.results, null, 1)}
                    </pre>
                  </CardContent>
                </Card>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <AlertTriangle className="h-12 w-12 mb-4 text-slate-400" />
                <p>No results available for this test yet.</p>
                {['created', 'failed'].includes(selectedTest?.status) && (
                  <Button 
                    onClick={() => {
                      setSelectedTest(null);
                      handleRunTest(selectedTest._id);
                    }}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" /> Run Test Now
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="script" className="h-full">
            <ScrollArea className="h-full pr-4" style={{ maxWidth: 'calc(100vw - 4rem)' }}>
              <Card>
                <CardHeader>
                  <CardTitle>Test Script</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap break-all text-sm">
                    {selectedTest?.script || 'No script available'}
                  </pre>
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="metrics" className="h-full">
            <ScrollArea className="h-full pr-4">
              {selectedTest?.results?.detailedMetrics ? (
                <div className="space-y-6">
                  {/* General Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>General Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Checks Rate</p>
                        <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.checksRate.toFixed(2)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Data Received</p>
                        <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.dataReceived}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Data Sent</p>
                        <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.dataSent}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Duration Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Duration Metrics (ms)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* HTTP Request Duration */}
                        <div>
                          <h4 className="font-medium mb-2">HTTP Request Duration</h4>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            <MetricItem label="AVG" value={selectedTest.results.detailedMetrics.httpReqDuration.avg} />
                            <MetricItem label="MIN" value={selectedTest.results.detailedMetrics.httpReqDuration.min} />
                            <MetricItem label="MED" value={selectedTest.results.detailedMetrics.httpReqDuration.med} />
                            <MetricItem label="MAX" value={selectedTest.results.detailedMetrics.httpReqDuration.max} />
                            <MetricItem label="P90" value={selectedTest.results.detailedMetrics.httpReqDuration.p90} />
                            <MetricItem label="P95" value={selectedTest.results.detailedMetrics.httpReqDuration.p95} />
                          </div>
                        </div>

                        {/* Iteration Duration */}
                        <div>
                          <h4 className="font-medium mb-2">Iteration Duration</h4>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            <MetricItem label="AVG" value={selectedTest.results.detailedMetrics.iterationDuration.avg} />
                            <MetricItem label="MIN" value={selectedTest.results.detailedMetrics.iterationDuration.min} />
                            <MetricItem label="MED" value={selectedTest.results.detailedMetrics.iterationDuration.med} />
                            <MetricItem label="MAX" value={selectedTest.results.detailedMetrics.iterationDuration.max} />
                            <MetricItem label="P90" value={selectedTest.results.detailedMetrics.iterationDuration.p90} />
                            <MetricItem label="P95" value={selectedTest.results.detailedMetrics.iterationDuration.p95} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rates and Counts */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Rates and Counts</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">HTTP Request Rate</p>
                        <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.httpReqRate.toFixed(2)}/s</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-semibold text-green-600">{selectedTest.results.detailedMetrics.successRate.toFixed(2)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Failed Requests</p>
                        <p className="text-2xl font-semibold text-red-600">{selectedTest.results.detailedMetrics.httpReqFailed.toFixed(2)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Iterations</p>
                        <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.iterations}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <AlertTriangle className="h-12 w-12 mb-4 text-slate-400" />
                  <p>No detailed metrics available for this test.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="logs" className="h-full">
            <ScrollArea className="h-full pr-4">
              {selectedTest?.logs?.length > 0 ? (
                <div className="space-y-3">
                  {selectedTest.logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        log.level === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                        log.level === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                        'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs opacity-70">
                          {format(log.timestamp, 'HH:mm:ss.SSS')}
                        </span>
                        <Badge variant={
                          log.level === 'error' ? 'destructive' : 
                          log.level === 'warn' ? 'outline' : 'secondary'
                        }>
                          {log.level}
                        </Badge>
                      </div>
                      <div className="font-medium">{log.message}</div>
                      {log.data && (
                        <pre className="mt-2 text-xs bg-white bg-opacity-50 p-3 rounded overflow-x-auto border border-slate-200">
                          {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Clock className="h-12 w-12 mb-4 text-slate-400" />
                  <p>No logs available for this test.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
    
    <DialogFooter>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setSelectedTest(null)}
        >
          Close
        </Button>
        {['created', 'completed', 'failed'].includes(selectedTest?.status) && (
          <Button 
            onClick={() => {
              setSelectedTest(null);
              handleRunTest(selectedTest._id);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" /> Run Test
          </Button>
        )}
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}