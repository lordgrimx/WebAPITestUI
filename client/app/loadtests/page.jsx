"use client";

import React, { useState, useEffect } from 'react'; // useEffect ekledim
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
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Timer, 
  LineChart,
  Trash2,
  AlertCircleIcon,
  ArrowRightCircleIcon,
  XCircleIcon,
  HelpCircleIcon,
  CheckCheckIcon,
  ActivityIcon,
  Square
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

const stopK6Test = async (runId) => {
  console.log("Stopping test with runId:", runId);
  const response = await authAxios.post(`/K6/stop/${runId}`);
  console.log("Stop test response:", response.data);
  
  return response.data;
};

const deleteK6Test = async (testId) => {
  const response = await authAxios.delete(`/K6Test/${testId}`);
  return response.data;
};

// Add fetchLogs function
const fetchLogs = async (testId) => {
  try {
    const response = await authAxios.get(`/k6test/${testId}/logs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
    toast.error('Failed to fetch test logs');
    return [];
  }
};

export default function LoadTestsPage() {
  const [k6Tests, setK6Tests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isRunning, setIsRunning] = useState({});
  const [isStopping, setIsStopping] = useState({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Translation map güncelleme
  const statusTranslations = {
    created: "Oluşturuldu",
    pending: "Beklemede",
    running: "Çalışıyor",
    completed: "Tamamlandı",
    failed: "Başarısız",
    stopping: "Durduruluyor"
  };

  // Testleri backend'den çekme
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await authAxios.get('/K6Test');
        // Status code'ları normalize et
        const normalizedTests = response.data.map(test => ({
          ...test,
          results: test.results ? {
            ...test.results,
            statusCodes: {
              status200: test.results.statusCodes?.status_200 || 0,
              status201: test.results.statusCodes?.status_201 || 0,
              status204: test.results.statusCodes?.status_204 || 0,
              status400: test.results.statusCodes?.status_400 || 0,
              status401: test.results.statusCodes?.status_401 || 0,
              status403: test.results.statusCodes?.status_403 || 0,
              status404: test.results.statusCodes?.status_404 || 0,
              status415: test.results.statusCodes?.status_415 || 0,
              status500: test.results.statusCodes?.status_500 || 0,
              other: test.results.statusCodes?.other || 0
            }
          } : null
        }));
        setK6Tests(normalizedTests);
      } catch (error) {
        console.error("Error loading tests", error);
        toast.error("Testleri yükleme başarısız", {
          description: error.response?.data?.message || error.message
        });
      }
    };

    fetchTests();

    const pollInterval = setInterval(fetchTests, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(pollInterval);
  }, []);

  const handleRunTest = async (testId) => {
    try {
      setIsRunning(prev => ({ ...prev, [testId]: true }));
      toast.info("Test çalışıyor", { description: "İşlem zaman alabilir" });
      
      // Execute the test
      const testInfo = await executeK6Test(testId);
      
      // Test seçeneklerinden gelen verileri kontrol et
      console.log("Test options from backend:", testInfo.options);
      
      // Kullanıcının seçtiği test seçeneklerini (parametreleri) almak için testi bulalım
      const currentTest = k6Tests.find(test => test.id === testId);
      
      // Options değerlerini doğru şekilde al
      // Öncelik sırası: 1. Kullanıcının daha önce seçtiği değerler, 2. Backend'den gelen değerler, 3. Varsayılan değerler
      const k6Options = {
        vus: currentTest?.options?.vus || testInfo.options?.vus || 10,
        duration: currentTest?.options?.duration || testInfo.options?.duration || "30s"
      };
      
      console.log("Using K6 options:", k6Options);
      
      const response = await authAxios.post('/K6/run', {
        script: testInfo.script,
        options: k6Options
      });

      console.log();
      
      
      // K6/run endpoint'inden dönen runId'yi sakla
      const runId = response.data.runId || response.data.testId;
      console.log("K6 test started with runId:", runId);
      console.log("K6 test started with testId:", testId);
      
      // Test ID'sini güncelle - bu ID'yi durdurma işlemi için kullanacağız
      setK6Tests(prevTests => prevTests.map(t => {
        if (t.id === testId) {
          return { ...t, runId: runId, status: "running" };
        }
        return t;
      }));

      const results = response.data;
      console.log("Test results:", results);

      // Fetch logs periodically during test execution
      const logInterval = setInterval(async () => {
        const logs = await fetchLogs(testId);
        setK6Tests(prevTests => prevTests.map(t => {
          if (t.id === testId) {
            return { ...t, logs };
          }
          return t;
        }));
      }, 2000);

      // Clean up interval after test completion
      setTimeout(() => clearInterval(logInterval), 5000);

      // State'i güncelle
      setK6Tests(prevTests => prevTests.map(t => {
        if (t.id === testId) {
          return {
            ...t,
            status: "completed",
            results: {
              vus: testInfo.options?.vus || 10,
              duration: testInfo.options?.duration || "30s",
              requestsPerSecond: results.metrics?.http_Reqs?.rate || 0,
              failureRate: results.metrics?.http_Req_Failed?.rate || 0,
              averageResponseTime: results.metrics?.http_Req_Duration?.trend?.avg || 0,
              p95ResponseTime: results.metrics?.http_Req_Duration?.trend?.p95 || 0,
              timestamp: Date.now(),
              detailedMetrics: {
                checksRate: results.metrics?.checks?.rate || 0,
                dataReceived: results.metrics?.data?.count || "N/A",
                dataSent: results.metrics?.data?.count || "N/A",
                httpReqRate: results.metrics?.http_reqs?.rate || 0,
                httpReqFailed: results.metrics?.http_req_failed?.rate || 0,
                successRate: results.metrics?.checks?.rate || 0,
                iterations: results.metrics?.iterations?.count || 0,
                httpReqDuration: {
                  avg: results.metrics?.http_Req_Duration?.trend?.avg || 0,
                  min: results.metrics?.http_Req_Duration?.trend?.min || 0,
                  med: results.metrics?.http_Req_Duration?.trend?.med || 0,
                  max: results.metrics?.http_Req_Duration?.trend?.max || 0,
                  p90: results.metrics?.http_Req_Duration?.trend?.p90 || 0,
                  p95: results.metrics?.http_Req_Duration?.trend?.p95 || 0
                },
                iterationDuration: {
                  avg: results.metrics?.iterations?.trend?.avg || 0,
                  min: results.metrics?.iterations?.trend?.min || 0,
                  med: results.metrics?.iterations?.trend?.med || 0,
                  max: results.metrics?.iterations?.trend?.max || 0,
                  p90: results.metrics?.iterations?.trend?.p90 || 0,
                  p95: results.metrics?.iterations?.trend?.p95 || 0
                }
              },
              statusCodes: {
                status200: results.metrics?.statusCodes?.status200 || 0,
                status201: results.metrics?.statusCodes?.status201 || 0,
                status204: results.metrics?.statusCodes?.status204 || 0,
                status400: results.metrics?.statusCodes?.status400 || 0,
                status401: results.metrics?.statusCodes?.status401 || 0,
                status403: results.metrics?.statusCodes?.status403 || 0,
                status404: results.metrics?.statusCodes?.status404 || 0,
                status415: results.metrics?.statusCodes?.status415 || 0,
                status500: results.metrics?.statusCodes?.status500 || 0,
                other: results.metrics?.statusCodes?.other || 0
              }
            }
          };
        }
        return t;
      }));

      // Test sonuçlarını backend'e kaydet
      try {
        console.log("Saving test results to backend for test ID:", testId);
        const formattedResults = {
          status: "completed",
          results: {
            vus: testInfo.options?.vus || 10,
            duration: testInfo.options?.duration || "30s",
            requestsPerSecond: results.metrics?.http_Reqs?.rate || 0,
            failureRate: results.metrics?.http_Req_Failed?.rate || 0,
            averageResponseTime: results.metrics?.http_Req_Duration?.trend?.avg || 0,
            p95ResponseTime: results.metrics?.http_Req_Duration?.trend?.p95 || 0,
            timestamp: Date.now(),
            detailedMetrics: {
              checksRate: results.metrics?.checks?.rate || 0,
              dataReceived: results.metrics?.data?.count?.toString() || "0",
              dataSent: results.metrics?.data?.count?.toString() || "0",
              httpReqRate: results.metrics?.http_Reqs?.rate || 0,
              httpReqFailed: results.metrics?.http_Req_Failed?.rate || 0,
              successRate: results.metrics?.checks?.rate || 0,
              iterations: results.metrics?.iterations?.count || 0,
              httpReqDuration: {
                avg: results.metrics?.http_Req_Duration?.trend?.avg || 0,
                min: results.metrics?.http_Req_Duration?.trend?.min || 0,
                med: results.metrics?.http_Req_Duration?.trend?.med || 0,
                max: results.metrics?.http_Req_Duration?.trend?.max || 0,
                p90: results.metrics?.http_Req_Duration?.trend?.p90 || 0,
                p95: results.metrics?.http_Req_Duration?.trend?.p95 || 0
              },
              iterationDuration: {
                avg: results.metrics?.iterations?.trend?.avg || 0,
                min: results.metrics?.iterations?.trend?.min || 0,
                med: results.metrics?.iterations?.trend?.med || 0,
                max: results.metrics?.iterations?.trend?.max || 0,
                p90: results.metrics?.iterations?.trend?.p90 || 0,
                p95: results.metrics?.iterations?.trend?.p95 || 0
              },
            },
            statusCodes: {
              status_200: results.metrics?.statusCodes?.status200 || 0,
              status_201: results.metrics?.statusCodes?.status201 || 0,
              status_204: results.metrics?.statusCodes?.status204 || 0,
              status_400: results.metrics?.statusCodes?.status400 || 0,
              status_401: results.metrics?.statusCodes?.status401 || 0,
              status_403: results.metrics?.statusCodes?.status403 || 0,
              status_404: results.metrics?.statusCodes?.status404 || 0,
              status_415: results.metrics?.statusCodes?.status415 || 0,
              status_500: results.metrics?.statusCodes?.status500 || 0,
              other: results.metrics?.statusCodes?.other || 0
            }
          }
        };
        
        console.log("Formatted results:", JSON.stringify(formattedResults));
        const response = await authAxios.put(`/K6Test/${testId}/results`, formattedResults);
        console.log("Results saved successfully:", response.status);
      } catch (error) {
        console.error("Error saving test results:", error.response?.data || error.message);
        toast.error("Test sonuçlarını kaydetme hatası", {
          description: error.response?.data?.error || error.message
        });
      }

      toast.success("Test tamamlandı", {
        description: `RPS: ${results.metrics?.http_reqs?.rate?.toFixed(2) || 0}, Hata Oranı: ${(100 - (results.metrics?.checks?.rate || 0)).toFixed(2)}%`
      });
    } catch (error) {
      console.error("Test çalıştırma hatası", error);
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

      toast.error("Test çalıştırma başarısız", { 
        description: error.response?.data?.message || error.message 
      });
    } finally {
      setIsRunning(prev => ({ ...prev, [testId]: false }));
    }
  };

  const handleStopTest = async (testId) => {
    try {
      setIsStopping(prev => ({ ...prev, [testId]: true }));
      
      // Update UI immediately for better user experience
      setK6Tests(prevTests => prevTests.map(t => {
        if (t.id === testId) {
          return {
            ...t,
            status: "stopping"
          };
        }
        return t;
      }));
      
      toast.info("Test durduruluyor", { description: "Lütfen bekleyin..." });
      
      // Doğru test ID'sini bul - runId varsa onu kullan, yoksa normal id'yi kullan
      const test = k6Tests.find(t => t.id === testId);
      const runIdToStop = test?.runId;
      
      if (!runIdToStop) {
        console.error("RunId bulunamadı, test durdurulamıyor");
        toast.error("Test durdurulamadı", { 
          description: "Test çalıştırma ID'si bulunamadı. Test zaten tamamlanmış olabilir."
        });
        setIsStopping(prev => ({ ...prev, [testId]: false }));
        return;
      }
      
      console.log("Stopping test with runId:", runIdToStop);
      
      // Call backend to stop the test with the correct runId
      await stopK6Test(runIdToStop);
      
      // Refresh tests to get the updated status
      const response = await authAxios.get('/K6Test');
      setK6Tests(response.data);
      
      toast.success("Test durduruldu");
    } catch (error) {
      console.error("Test durdurma hatası", error);
      toast.error("Test durdurma başarısız", {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setIsStopping(prev => ({ ...prev, [testId]: false }));
    }
  };

  const handleDeleteTest = async (testId) => {
    try {
      await deleteK6Test(testId);
      setK6Tests(prevTests => prevTests.filter(t => t.id !== testId));
      toast.success("Test silindi");
    } catch (error) {
      console.error("Test silme hatası", error);
      toast.error("Silme başarısız", {
        description: error.response?.data?.message || error.message
      });
    }
  };

  const handleTestCreated = (newTestId) => {
    const fetchTests = async () => {
      try {
        const response = await authAxios.get('/K6Test');
        setK6Tests(response.data);
      } catch (error) {
        console.error("Testleri yükleme hatası", error);
        toast.error("Testleri yükleme başarısız");
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

  const calculatePerformanceScore = (test) => {
    if (!test.results) return null;
    
    const failureScore = Math.max(0, 100 - test.results.failureRate);
    const rpsScore = Math.min(100, (test.results.requestsPerSecond / 50) * 100);
    const respTimeScore = Math.max(0, 100 - ((test.results.averageResponseTime / 10)));
    return Math.round((failureScore * 0.4) + (rpsScore * 0.3) + (respTimeScore * 0.3));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Yük Testleri</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Yeni Test Oluştur
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
                  </div>
                  <Badge className={`${statusColors[test.status]} text-white`}>
                    <span className="flex items-center gap-1">
                      {statusIcons[test.status]}
                      {statusTranslations[test.status] || test.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded-lg">
                    <Users className="h-4 w-4 mb-1 text-slate-500" />
                    <span className="text-lg font-medium">{test.results?.vus || 0}</span>
                    <span className="text-xs text-slate-500">Sanal Kullanıcılar</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded-lg">
                    <Timer className="h-4 w-4 mb-1 text-slate-500" />
                    <span className="text-lg font-medium">{test.results?.duration || "N/A"}</span>
                    <span className="text-xs text-slate-500">Süre</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded-lg">
                    <LineChart className="h-4 w-4 mb-1 text-slate-500" />
                    <span className="text-lg font-medium">{test.results?.requestsPerSecond?.toFixed(1) || 0}</span>
                    <span className="text-xs text-slate-500">İstek/Saniye</span>
                  </div>
                </div>
                {test.status === 'completed' && performanceScore !== null && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performans Skoru</span>
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
                      <span className="font-medium">{test.results?.failureRate?.toFixed(1)}%</span> Hata Oranı
                    </div>
                    <div>
                      <span className="font-medium">{test.results?.averageResponseTime?.toFixed(0)}</span> ms Ort. Yanıt
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
                    Detaylar
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
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Çalışıyor
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" /> Testi Çalıştır
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
                  )}
                  {test.status === 'running' && (
                    <>
                      <Button
                        onClick={() => handleStopTest(test.id)}
                        disabled={isStopping[test.id]}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        {isStopping[test.id] ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Durduruluyor
                          </>
                        ) : (
                          <>
                            <Square className="h-4 w-4 mr-2" /> Testi Durdur
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
                  )}

                  {test.status === 'stopping' && (
                    <Button
                      disabled
                      className="flex-1 bg-purple-500 text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Durduruluyor
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
        <DialogContent className="max-w-4xl w-full overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Test Detayları: {selectedTest?.name}</span>
              <Badge className={`${statusColors[selectedTest?.status || 'created']} text-white`}>
                <span className="flex items-center gap-1">
                  {statusIcons[selectedTest?.status]}
                  {statusTranslations[selectedTest?.status] || selectedTest?.status}
                </span>
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <Tabs defaultValue="results">
              <TabsList className="w-full">
                <TabsTrigger value="results" className="flex-1">Sonuçlar</TabsTrigger>
                <TabsTrigger value="script" className="flex-1">Senaryo</TabsTrigger>
                <TabsTrigger value="metrics" className="flex-1">Metrikler</TabsTrigger>
                <TabsTrigger value="logs" className="flex-1">Loglar</TabsTrigger>
              </TabsList>
              
              <div className="h-[500px] overflow-hidden">
                <TabsContent value="results" className="h-full">
                  {selectedTest?.results ? (
                    <ScrollArea className="h-full pr-4">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500">Sanal Kullanıcılar</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold">{selectedTest.results.vus}</span>
                              <span className="ml-2 text-sm text-slate-500">Kullanıcı</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500">Süre</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold">{selectedTest.results.duration}</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500">İstek/Saniye</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold">{selectedTest.results.requestsPerSecond.toFixed(2)}</span>
                              <span className="ml-2 text-sm text-slate-500">istek/s</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500">Hata Oranı</CardTitle>
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
                            <CardTitle className="text-sm text-slate-500">Ort. Yanıt Süresi</CardTitle>
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
                            <CardTitle className="text-sm text-slate-500">P95 Yanıt Süresi</CardTitle>
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
                          <CardTitle>Ham Sonuçlar</CardTitle>
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
                      <p>Sonuç bulunamadı</p>
                      {['created', 'failed'].includes(selectedTest?.status) && (
                        <Button 
                          onClick={() => {
                            setSelectedTest(null);
                            handleRunTest(selectedTest.id);
                          }}
                          className="mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-2" /> Testi Şimdi Başlat
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="script" className="h-full">
                  <ScrollArea className="h-full pr-4" style={{ maxWidth: 'calc(100vw - 4rem)' }}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Test Senaryosu</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap break-all text-sm">
                          {selectedTest?.script || "Senaryo bulunamadı"}
                        </pre>
                      </CardContent>
                    </Card>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="metrics" className="h-full">
                  <ScrollArea className="h-full pr-4">
                    {selectedTest?.results?.detailedMetrics ? (
                      <div className="space-y-6">
                        <Card>
                          <CardHeader className='font-bold'>
                            <CardTitle>Genel Metrikler</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Kontrol Oranı</p>
                              <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.checksRate.toFixed(2)}%</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Alınan Veri</p>
                              <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.dataReceived}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Gönderilen Veri</p>
                              <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.dataSent}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className='font-bold'>
                            <CardTitle>Süre Metrikleri</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">HTTP İstek Süresi</h4>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                  <MetricItem label="Ort." value={selectedTest.results.detailedMetrics.httpReqDuration.avg} />
                                  <MetricItem label="Min" value={selectedTest.results.detailedMetrics.httpReqDuration.min} />
                                  <MetricItem label="Med" value={selectedTest.results.detailedMetrics.httpReqDuration.med} />
                                  <MetricItem label="Max" value={selectedTest.results.detailedMetrics.httpReqDuration.max} />
                                  <MetricItem label="P90" value={selectedTest.results.detailedMetrics.httpReqDuration.p90} />
                                  <MetricItem label="P95" value={selectedTest.results.detailedMetrics.httpReqDuration.p95} />
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">İterasyon Süresi</h4>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                  <MetricItem label="Ort." value={selectedTest.results.detailedMetrics.iterationDuration.avg} />
                                  <MetricItem label="Min" value={selectedTest.results.detailedMetrics.iterationDuration.min} />
                                  <MetricItem label="Med" value={selectedTest.results.detailedMetrics.iterationDuration.med} />
                                  <MetricItem label="Max" value={selectedTest.results.detailedMetrics.iterationDuration.max} />
                                  <MetricItem label="P90" value={selectedTest.results.detailedMetrics.iterationDuration.p90} />
                                  <MetricItem label="P95" value={selectedTest.results.detailedMetrics.iterationDuration.p95} />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className='font-bold'>Oranlar ve Sayılar</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">HTTP İstek Oranı</p>
                              <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.httpReqRate.toFixed(2)}/s</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Başarı Oranı</p>
                              <p className="text-2xl font-semibold text-green-600">{selectedTest.results.detailedMetrics.successRate.toFixed(2)}%</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Başarısız İstekler</p>
                              <p className="text-2xl font-semibold text-red-600">{(selectedTest.results.detailedMetrics.httpReqFailed).toFixed(2)}%</p> 
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Toplam İterasyon</p>
                              <p className="text-2xl font-semibold">{selectedTest.results.detailedMetrics.iterations}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card >
                          <CardHeader >
                            <CardTitle className="text-xl font-bold flex items-center">
                              <ActivityIcon className="mr-2 h-5 w-5" />
                              Durum Kodları Genel Bakış
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                              {Object.entries(selectedTest.results?.statusCodes || {}).map(([key, value]) => {
                                const statusCode = key.replace('status', '');
                                let bgColor = 'bg-slate-50';
                                let textColor = 'text-slate-600';
                                let borderColor = 'border-slate-200';
                                let icon = null;
                                let label = "";

                                if (statusCode.startsWith('2')) {
                                  bgColor = 'bg-green-50';
                                  textColor = 'text-green-600';
                                  borderColor = 'border-green-200';
                                  icon = <CheckCheckIcon className="h-4 w-4 text-green-500" />;
                                  label = "Başarılı";
                                } else if (statusCode.startsWith('3')) {
                                  bgColor = 'bg-blue-50';
                                  textColor = 'text-blue-600';
                                  borderColor = 'border-blue-200';
                                  icon = <ArrowRightCircleIcon className="h-4 w-4 text-blue-500" />;
                                  label = "Yönlendirme";
                                } else if (statusCode.startsWith('4')) {
                                  bgColor = 'bg-amber-50';
                                  textColor = 'text-amber-600';
                                  borderColor = 'border-amber-200';
                                  icon = <AlertCircleIcon className="h-4 w-4 text-amber-500" />;
                                  label = "İstemci Hatası";
                                } else if (statusCode.startsWith('5')) {
                                  bgColor = 'bg-rose-50';
                                  textColor = 'text-rose-600';
                                  borderColor = 'border-rose-200';
                                  icon = <XCircleIcon className="h-4 w-4 text-rose-500" />;
                                  label = "Sunucu Hatası";
                                } else if (key === 'other') {
                                  icon = <HelpCircleIcon className="h-4 w-4 text-slate-500" />;
                                  label = "Diğer";
                                }

                                return (
                                  <div 
                                    key={key} 
                                    className={`p-4 rounded-lg ${bgColor} border ${borderColor} transition-all hover:shadow-md`}
                                  >
                                    <div className="flex items-center mb-2">
                                      {icon}
                                      <p className="text-xs font-medium ml-1 text-slate-500">
                                        {key === 'other' ? "Diğer" : `${statusCode} ${label}`}
                                      </p>
                                    </div>
                                    <p className={`text-xl font-bold ${textColor}`}>
                                      {value}
                                    </p>
                                    <div className="flex justify-between items-center mt-2">
                                      <p className="text-xs text-slate-500">
                                        {value > 0 ? 'istekler' : 'istek yok'}
                                      </p>
                                      {value > 0 && (
                                        <span className="text-xs px-2 py-1 bg-white rounded-full shadow-sm font-medium text-slate-600">
                                          {((value / Object.values(selectedTest.results?.statusCodes || {}).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card> 
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <AlertTriangle className="h-12 w-12 mb-4 text-slate-400" />
                        <p>Detaylı metrikler bulunamadı</p>
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
                        <p>Loglar bulunamadı</p>
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
                İptal
              </Button>
              {['created', 'completed', 'failed'].includes(selectedTest?.status) && (
                <Button 
                  onClick={() => {
                    setSelectedTest(null);
                    handleRunTest(selectedTest.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" /> Testi Başlat
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
