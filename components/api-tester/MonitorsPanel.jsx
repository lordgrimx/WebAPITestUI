"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";

export default function MonitorsPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const monitors = [
    {
      id: 1,
      name: "Production API Health Check",
      status: "healthy",
      uptime: "99.9%",
      lastChecked: "2 mins ago",
      responseTime: "234ms",
    },
    {
      id: 2,
      name: "Authentication Service",
      status: "degraded",
      uptime: "98.5%",
      lastChecked: "5 mins ago",
      responseTime: "890ms",
    },
  ];

  return (
    <div className="h-full flex flex-col border-gray-200 bg-white dark:bg-gray-900">
      <div className="p-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">Monitors</h3>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-1" /> New Monitor
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="border-b px-4 justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="uptime">Uptime</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="p-2 m-0">
            <div className="grid gap-4">
              {monitors.map((monitor) => (
                <div key={monitor.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{monitor.name}</h4>
                    <Badge
                      variant={monitor.status === "healthy" ? "success" : "warning"}
                      className="capitalize"
                    >
                      {monitor.status === "healthy" ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {monitor.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Uptime</p>
                      <p className="font-medium">{monitor.uptime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Response Time</p>
                      <p className="font-medium">{monitor.responseTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Check</p>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {monitor.lastChecked}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="uptime" className="p-4 m-0">
            <div className="text-center text-gray-500 py-8">
              Uptime monitoring stats will appear here
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="p-4 m-0">
            <div className="text-center text-gray-500 py-8">
              Performance metrics will appear here
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
