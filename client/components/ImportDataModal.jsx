"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ImportDataModal({
  open,
  setOpen,
  importData,
  onImportConfirm,
  darkMode,
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("request");

  console.log("ImportDataModal received importData:", importData);
  console.log("ImportDataModal received collections:", importData?.collections);
  console.log("ImportDataModal received history:", importData?.history);

  const handleConfirmImport = () => {
    try {
      onImportConfirm(importData);
      toast.success(t("import.success", "Data imported successfully"));
      setOpen(false);
    } catch (error) {
      console.error("Failed to import data:", error);
      toast.error(t("import.failed", "Failed to import data"));
    }
  };

  // Güvenli bir şekilde verileri JSON olarak formatla
  const formatJson = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return "Invalid JSON";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={`sm:max-w-[600px] ${darkMode ? "bg-gray-800 text-white" : ""}`}>
        <DialogHeader>
          <DialogTitle className={darkMode ? "text-white" : ""}>
            {t("import.title", "Import Shared Data")}
          </DialogTitle>
          <DialogDescription className={darkMode ? "text-gray-300" : ""}>
            {t("import.description", "Review and confirm importing the following data")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="request" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="request" className="flex-1">
              {t("import.request", "Request")}
            </TabsTrigger>
            {importData?.environment && (
              <TabsTrigger value="environment" className="flex-1">
                {t("import.environment", "Environment")}
              </TabsTrigger>
            )}
            {importData?.collections && importData.collections.length > 0 && (
              <TabsTrigger value="collections" className="flex-1">
                {t("import.collections", "Collections")}
              </TabsTrigger>
            )}
            {importData?.history && importData.history.length > 0 && (
              <TabsTrigger value="history" className="flex-1">
                {t("import.history", "History")}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="request" className="border rounded-md p-4 mt-4 max-h-[400px] overflow-y-auto">
            {importData?.request ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${getBadgeClass(importData.request.method)}`}>
                    {importData.request.method || "GET"}
                  </Badge>
                  <span className="text-sm font-mono overflow-hidden overflow-ellipsis">
                    {importData.request.url}
                  </span>
                </div>

                {importData.request.body && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Body:</h3>
                    <pre className={`text-xs p-3 rounded overflow-x-auto ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                      {importData.request.body}
                    </pre>
                  </div>
                )}

                {importData.request.headers && Object.keys(importData.request.headers).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Headers:</h3>
                    <pre className={`text-xs p-3 rounded overflow-x-auto ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                      {formatJson(importData.request.headers)}
                    </pre>
                  </div>
                )}

                {importData.request.params && Object.keys(importData.request.params).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Query Parameters:</h3>
                    <pre className={`text-xs p-3 rounded overflow-x-auto ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                      {formatJson(importData.request.params)}
                    </pre>
                  </div>
                )}

                {importData.request.auth && importData.request.auth.type !== 'none' && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Authentication ({importData.request.auth.type}):</h3>
                    <pre className={`text-xs p-3 rounded overflow-x-auto ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                      {formatJson(importData.request.auth)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p>{t("import.noRequestData", "No request data to import")}</p>
            )}
          </TabsContent>

          {importData?.environment && (
            <TabsContent value="environment" className="border rounded-md p-4 mt-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold">{importData.environment.name}</h3>
                  {importData.environment.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{importData.environment.description}</p>
                  )}
                </div>

                {importData.environment.variables && importData.environment.variables.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Environment Variables:</h3>
                    <div className="border rounded overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Key</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Value</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                          {importData.environment.variables.map((variable, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{variable.key}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-mono">
                                {variable.value.length > 30 ? variable.value.substring(0, 30) + '...' : variable.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
         )}

         {importData?.collections && importData.collections.length > 0 && (
           <TabsContent value="collections" className="border rounded-md p-4 mt-4 max-h-[400px] overflow-y-auto">
             <div>
               <h3 className="text-base font-semibold mb-2">{t("import.collections", "Collections")}</h3>
               <pre className={`text-xs p-3 rounded overflow-x-auto ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                 {formatJson(importData.collections)}
               </pre>
             </div>
           </TabsContent>
         )}

         {importData?.history && importData.history.length > 0 && (
           <TabsContent value="history" className="border rounded-md p-4 mt-4 max-h-[400px] overflow-y-auto">
             <div>
               <h3 className="text-base font-semibold mb-2">{t("import.history", "History")}</h3>
               <pre className={`text-xs p-3 rounded overflow-x-auto ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                 {formatJson(importData.history)}
               </pre>
             </div>
           </TabsContent>
         )}
       </Tabs>

       <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className={darkMode ? "text-white border-gray-600" : ""}
          >
            {t("general.cancel", "Cancel")}
          </Button>
          <Button onClick={handleConfirmImport}>
            {t("import.confirmButton", "Import Data")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Method badge renklerini belirle
function getBadgeClass(method) {
  const methodMap = {
    GET: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
    POST: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
    PUT: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300",
    DELETE: "bg-red-100 text-red-800 hover:bg-red-200 border-red-300",
    PATCH: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300",
    OPTIONS: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300",
    HEAD: "bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-300",
  };

  return methodMap[method?.toUpperCase()] || "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300";
}
