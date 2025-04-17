"use client";

import React, { useState, useEffect } from 'react'; // useEffect ekledim
import { format } from "date-fns";
import { useTranslation } from 'react-i18next';
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
import { authAxios } from '@/lib/auth-context';
import { toast as sonnerToast } from 'sonner';
import LoadTestDialog from '@/components/api-tester/LoadTestDialog';

function MetricItem({ label, value }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold">{value?.toFixed(2) || '0.00'}</p>
    </div>
  );
}

const executeK6Test = async (testId) => {
  const response = await authAxios.post(`/K6Test/${testId}/execute`);
  return response.data;
};

const deleteK6Test = async (testId) => {
  const response = await authAxios.delete(`/K6Test/${testId}`);
  return response.data;
};

export default function LoadTestsPage() {  const { t } = useTranslation();
  const [k6Tests, setK6Tests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isRunning, setIsRunning] = useState({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Translation map for status strings
  const statusTranslations = {
    created: t("loadTests.statusCreated"),
    pending: t("loadTests.statusPending"),
    running: t("loadTests.statusRunning"),
    completed: t("loadTests.statusCompleted"),
    failed: t("loadTests.statusFailed")
  };

  // Testleri backend'den çekme
  useEffect(() => {
    const fetchTests = async () => {      try {
        const response = await authAxios.get('/K6Test');
        setK6Tests(response.data);
      } catch (error) {
        console.error(t("loadTests.errorLoading"), error);
        toast.error(t("loadTests.testLoadFailed"), {
          description: error.response?.data?.message || error.message
        });
      }
    };

    fetchTests();
  }, []);

  const handleRunTest = async (testId) => {    try {
      setIsRunning(prev => ({ ...prev, [testId]: true }));
      toast.info(t("loadTests.testRunning"), { description: t("loadTests.operationMayTakeTime") });
      
      // Execute the test
      const testInfo = await executeK6Test(testId);
      
      // K6 test scriptini çalıştır
      const response = await authAxios.post('/K6/run', {
        script: testInfo.script,
        options: testInfo.options || {
          vus: 10,
          duration: "30s"
        }
      });

      const results = response.data;

      // State'i güncelle
      setK6Tests(prevTests => prevTests.map(t => {
        if (t.id === testId) {
          return {
            ...t,
            status: "completed",
            results: {
              vus: testInfo.options?.vus || 10,
              duration: testInfo.options?.duration || "30s",
              requestsPerSecond: results.metrics?.http_reqs?.rate || 0,
              // Hata oranı doğrudan http_req_failed metriğinden alınacak
              failureRate: results.metrics?.http_req_failed?.rate || 0, 
              averageResponseTime: results.metrics?.http_reqs?.trend?.avg || 0,
              p95ResponseTime: results.metrics?.http_reqs?.trend?.p95 || 0,
              timestamp: Date.now(),
              detailedMetrics: {
                checksRate: results.metrics?.checks?.rate || 0,
            dataReceived: results.metrics?.data?.count || "N/A", // data_received metriği eklendi (varsa)
            dataSent: results.metrics?.data?.count || "N/A", // data_sent metriği eklendi (varsa) - K6 çıktısında ayrı ayrı yok, 'data' olarak var
            httpReqRate: results.metrics?.http_reqs?.rate || 0,
            // httpReqFailed metriği doğrudan kullanılacak
            httpReqFailed: results.metrics?.http_req_failed?.rate || 0, 
            // successRate, checks metriğine göre kalabilir veya 100 - failureRate olarak hesaplanabilir. Şimdilik checks kalsın.
            successRate: results.metrics?.checks?.rate || 0, 
            iterations: results.metrics?.iterations?.count || 0,
            httpReqDuration: {
                  avg: results.metrics?.http_reqs?.trend?.avg || 0,
                  min: results.metrics?.http_reqs?.trend?.min || 0,
                  med: results.metrics?.http_reqs?.trend?.med || 0,
                  max: results.metrics?.http_reqs?.trend?.max || 0,
                  p90: results.metrics?.http_reqs?.trend?.p90 || 0,
                  p95: results.metrics?.http_reqs?.trend?.p95 || 0
                },
                iterationDuration: {
                  avg: results.metrics?.iterations?.trend?.avg || 0,
                  min: results.metrics?.iterations?.trend?.min || 0,
                  med: results.metrics?.iterations?.trend?.med || 0,
                  max: results.metrics?.iterations?.trend?.max || 0,
                  p90: results.metrics?.iterations?.trend?.p90 || 0,
                  p95: results.metrics?.iterations?.trend?.p95 || 0
                }
              }
            }
          };
        }
        return t;
      }));      // Test sonuçlarını backend'e kaydet
      try {
        console.log("Saving test results to backend for test ID:", testId);
        
        // Format metrics in a way the backend expects
        const formattedResults = {
          status: "completed",
          metrics: {
            vus: testInfo.options?.vus || 10,
            duration: testInfo.options?.duration || "30s",
            requestsPerSecond: results.metrics?.http_reqs?.rate || 0,
            failureRate: results.metrics?.http_req_failed?.rate || 0,
            averageResponseTime: results.metrics?.http_reqs?.trend?.avg || 0,
            p95ResponseTime: results.metrics?.http_reqs?.trend?.p95 || 0,
            timestamp: new Date().toISOString(),
            detailedMetrics: JSON.stringify({
              checksRate: results.metrics?.checks?.rate || 0,
              dataReceived: results.metrics?.data?.count || 0,
              dataSent: results.metrics?.data?.count || 0, 
              httpReqRate: results.metrics?.http_reqs?.rate || 0,
              httpReqFailed: results.metrics?.http_req_failed?.rate || 0,
              successRate: results.metrics?.checks?.rate || 0,
              iterations: results.metrics?.iterations?.count || 0,
              httpReqDuration: {
                avg: results.metrics?.http_reqs?.trend?.avg || 0,
                min: results.metrics?.http_reqs?.trend?.min || 0,
                med: results.metrics?.http_reqs?.trend?.med || 0,
                max: results.metrics?.http_reqs?.trend?.max || 0,
                p90: results.metrics?.http_reqs?.trend?.p90 || 0,
                p95: results.metrics?.http_reqs?.trend?.p95 || 0
              },
              iterationDuration: {
                avg: results.metrics?.iterations?.trend?.avg || 0,
                min: results.metrics?.iterations?.trend?.min || 0,
                med: results.metrics?.iterations?.trend?.med || 0,
                max: results.metrics?.iterations?.trend?.max || 0,
                p90: results.metrics?.iterations?.trend?.p90 || 0,
                p95: results.metrics?.iterations?.trend?.p95 || 0
              }
            })
          }
        };
        
        console.log("Formatted results:", JSON.stringify(formattedResults));
        const response = await authAxios.put(`/K6Test/${testId}/results`, formattedResults);
        console.log("Results saved successfully:", response.status);
      } catch (error) {
        console.error("Error saving test results:", error.response?.data || error.message);
        toast.error(t("loadTests.errorSavingResults"), {
          description: error.response?.data?.error || error.message
        });
      }toast.success(t("loadTests.testCompleted"), {
        description: `RPS: ${results.metrics?.http_reqs?.rate?.toFixed(2) || 0}, ${t("loadTests.errorRate")}: ${(100 - (results.metrics?.checks?.rate || 0)).toFixed(2)}%`
      });
    } catch (error) {
      console.error(t("loadTests.testRunError"), error);
      setK6Tests(prevTests => prevTests.map(t => {
        if (t.id === testId) {
          return {
            ...t,
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
          };
        }
        return t;
      }));

      toast.error(t("loadTests.testRunFailed"), { 
        description: error.response?.data?.message || error.message 
      });
    } finally {
      setIsRunning(prev => ({ ...prev, [testId]: false }));
    }
  };
  const handleDeleteTest = async (testId) => {
    try {
      await deleteK6Test(testId);
      setK6Tests(prevTests => prevTests.filter(t => t.id !== testId));
      toast.success(t("loadTests.testDeleted"));
    } catch (error) {
      console.error(t("loadTests.errorDeleting"), error);
      toast.error(t("loadTests.deleteFailed"), {
        description: error.response?.data?.message || error.message
      });
    }
  };
  const handleTestCreated = (newTestId) => {
    // Yeni test oluşturulduktan sonra listeyi güncelle
    const fetchTests = async () => {
      try {
        const response = await authAxios.get('/K6Test');
        setK6Tests(response.data);
      } catch (error) {
        console.error(t("loadTests.errorLoading"), error);
        toast.error(t("loadTests.testLoadFailed"));
      }
    };

    fetchTests();
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
        <h1 className="text-3xl font-bold">{t("loadTests.title")}</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          {t("loadTests.createNewTest")}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {k6Tests?.map((test) => {
          const performanceScore = calculatePerformanceScore(test);
          
          return (
            <Card key={test.id} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">{test.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {format(test.createdAt, 'PPpp')}
                    </CardDescription>
                  </div>                  <Badge className={`${statusColors[test.status]} text-white`}>
                    <span className="flex items-center gap-1">
                      {statusIcons[test.status]}
                      {statusTranslations[test.status] || test.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-3 gap-3 mb-4">                  <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded-lg">
                    <Users className="h-4 w-4 mb-1 text-slate-500" />
                    <span className="text-lg font-medium">{test.results?.vus || 0}</span>
                    <span className="text-xs text-slate-500">{t("loadTests.virtualUsers")}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded-lg">
                    <Timer className="h-4 w-4 mb-1 text-slate-500" />
                    <span className="text-lg font-medium">{test.results?.duration || "N/A"}</span>
                    <span className="text-xs text-slate-500">{t("loadTests.duration")}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded-lg">
                    <LineChart className="h-4 w-4 mb-1 text-slate-500" />
                    <span className="text-lg font-medium">{test.results?.requestsPerSecond?.toFixed(1) || 0}</span>
                    <span className="text-xs text-slate-500">{t("loadTests.reqSec")}</span>
                  </div>
                </div>
                  {test.status === 'completed' && performanceScore !== null && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t("loadTests.performanceScore")}</span>
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
                      <span className="font-medium">{test.results?.failureRate?.toFixed(1)}%</span> {t("loadTests.failureRate")}
                    </div>
                    <div>
                      <span className="font-medium">{test.results?.averageResponseTime?.toFixed(0)}</span> {t("loadTests.msAvgResponse")}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex gap-2 w-full">                  <Button
                    variant="outline"
                    onClick={() => setSelectedTest(test)}
                    className="flex-1"
                  >
                    {t("loadTests.details")}
                  </Button>
                  {['created', 'failed', 'completed'].includes(test.status) && (
                    <>
                      <Button
                        onClick={() => handleRunTest(test.id)}
                        disabled={isRunning[test.id]}
                        className={`flex-1 ${
                          isRunning[test.id] 
                            ? 'bg-blue-400' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      >
                        {isRunning[test.id] ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> {t("loadTests.running")}
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" /> {t("loadTests.runTest")}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteTest(test.id)}
                        className="bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}                  {test.status === 'running' && !isRunning[test.id] && (
                    <Button
                      disabled
                      className="flex-1 bg-blue-500 text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> {t("loadTests.running")}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <LoadTestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTestCreated={handleTestCreated}
        requestData={{
          method: "GET",
          url: "",
          headers: "{}",
          body: "",
          params: "{}"
        }}
      />

      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-4xl w-full overflow-hidden">          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{t("loadTests.testDetails")}: {selectedTest?.name}</span>              <Badge className={`${statusColors[selectedTest?.status || 'created']} text-white`}>
                <span className="flex items-center gap-1">
                  {statusIcons[selectedTest?.status]}
                  {statusTranslations[selectedTest?.status] || selectedTest?.status}
                </span>
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <Tabs defaultValue="results">              <TabsList className="w-full">
                <TabsTrigger value="results" className="flex-1">{t("loadTests.results")}</TabsTrigger>
                <TabsTrigger value="script" className="flex-1">{t("loadTests.script")}</TabsTrigger>
                <TabsTrigger value="metrics" className="flex-1">{t("loadTests.metrics")}</TabsTrigger>
                <TabsTrigger value="logs" className="flex-1">{t("loadTests.logs")}</TabsTrigger>
              </TabsList>
              
              <div className="h-[500px] overflow-hidden">
                <TabsContent value="results" className="h-full">
                  {selectedTest?.results ? (
                    <ScrollArea className="h-full pr-4">
                      <div className="grid grid-cols-2 gap-4 mb-6">                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500">{t("loadTests.virtualUsers")}</CardTitle>
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
                            <CardTitle className="text-sm text-slate-500">{t("loadTests.duration")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold">{selectedTest.results.duration}</span>
                            </div>
                          </CardContent>
                        </Card>
                          <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500">{t("loadTests.reqSec")}</CardTitle>
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
                            <CardTitle className="text-sm text-slate-500">{t("loadTests.failureRate")}</CardTitle>
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
                            <CardTitle className="text-sm text-slate-500">{t("loadTests.avgResponseTime")}</CardTitle>
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
                            <CardTitle className="text-sm text-slate-500">{t("loadTests.p95ResponseTime")}</CardTitle>
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
                          <CardTitle>{t("loadTests.rawResults")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                            {JSON.stringify(selectedTest.results, null, 1)}
                          </pre>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  ) : (                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <AlertTriangle className="h-12 w-12 mb-4 text-slate-400" />
                      <p>{t("loadTests.noResultsAvailable")}</p>
                      {['created', 'failed'].includes(selectedTest?.status) && (
                        <Button 
                          onClick={() => {
                            setSelectedTest(null);
                            handleRunTest(selectedTest.id);
                          }}
                          className="mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-2" /> {t("loadTests.runTestNow")}
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
                  <TabsContent value="script" className="h-full">
                  <ScrollArea className="h-full pr-4" style={{ maxWidth: 'calc(100vw - 4rem)' }}>
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("loadTests.testScript")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap break-all text-sm">
                          {selectedTest?.script || t("loadTests.noScriptAvailable")}
                        </pre>
                      </CardContent>
                    </Card>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="metrics" className="h-full">
                  <ScrollArea className="h-full pr-4">
                    {selectedTest?.results?.detailedMetrics ? (
                      <div className="space-y-6">
                        {/* General Metrics */}                        <Card>
                          <CardHeader>
                            <CardTitle>{t("loadTests.generalMetrics")}</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">{t("loadTests.checksRate")}</p>
                              <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.checksRate.toFixed(2)}%</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">{t("loadTests.dataReceived")}</p>
                              <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.dataReceived}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">{t("loadTests.dataSent")}</p>
                              <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.dataSent}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Duration Metrics */}                        <Card>
                          <CardHeader>
                            <CardTitle>{t("loadTests.durationMetrics")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* HTTP Request Duration */}
                              <div>
                                <h4 className="font-medium mb-2">{t("loadTests.httpRequestDuration")}</h4>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                  <MetricItem label={t("loadTests.avg")} value={selectedTest.results.detailedMetrics.httpReqDuration.avg} />
                                  <MetricItem label={t("loadTests.min")} value={selectedTest.results.detailedMetrics.httpReqDuration.min} />
                                  <MetricItem label={t("loadTests.med")} value={selectedTest.results.detailedMetrics.httpReqDuration.med} />
                                  <MetricItem label={t("loadTests.max")} value={selectedTest.results.detailedMetrics.httpReqDuration.max} />
                                  <MetricItem label={t("loadTests.p90")} value={selectedTest.results.detailedMetrics.httpReqDuration.p90} />
                                  <MetricItem label={t("loadTests.p95")} value={selectedTest.results.detailedMetrics.httpReqDuration.p95} />
                                </div>
                              </div>                              {/* Iteration Duration */}
                              <div>
                                <h4 className="font-medium mb-2">{t("loadTests.iterationDuration")}</h4>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                  <MetricItem label={t("loadTests.avg")} value={selectedTest.results.detailedMetrics.iterationDuration.avg} />
                                  <MetricItem label={t("loadTests.min")} value={selectedTest.results.detailedMetrics.iterationDuration.min} />
                                  <MetricItem label={t("loadTests.med")} value={selectedTest.results.detailedMetrics.iterationDuration.med} />
                                  <MetricItem label={t("loadTests.max")} value={selectedTest.results.detailedMetrics.iterationDuration.max} />
                                  <MetricItem label={t("loadTests.p90")} value={selectedTest.results.detailedMetrics.iterationDuration.p90} />
                                  <MetricItem label={t("loadTests.p95")} value={selectedTest.results.detailedMetrics.iterationDuration.p95} />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Rates and Counts */}                        <Card>
                          <CardHeader>
                            <CardTitle>{t("loadTests.ratesAndCounts")}</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">{t("loadTests.httpRequestRate")}</p>
                              <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.httpReqRate.toFixed(2)}/s</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">{t("loadTests.successRate")}</p>
                              <p className="text-2xl font-semibold text-green-600">{selectedTest.results.detailedMetrics.successRate.toFixed(2)}%</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">{t("loadTests.failedRequests")}</p>
                              {/* httpReqFailed metriği rate olarak geldiği için 100 ile çarpılmalı */}
                              <p className="text-2xl font-semibold text-red-600">{(selectedTest.results.detailedMetrics.httpReqFailed * 100).toFixed(2)}%</p> 
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">{t("loadTests.totalIterations")}</p>
                              <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.iterations}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (                      <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <AlertTriangle className="h-12 w-12 mb-4 text-slate-400" />
                        <p>{t("loadTests.noDetailedMetrics")}</p>
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
                    ) : (                      <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Clock className="h-12 w-12 mb-4 text-slate-400" />
                        <p>{t("loadTests.noLogsAvailable")}</p>
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
                {t("general.cancel")}
              </Button>
              {['created', 'completed', 'failed'].includes(selectedTest?.status) && (
                <Button 
                  onClick={() => {
                    setSelectedTest(null);
                    handleRunTest(selectedTest.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" /> {t("loadTests.runTest")}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
