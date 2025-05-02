"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  FileText, 
  Info,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy
} from "lucide-react";
import { toast } from "sonner";

function DocumentationDetailModal({ open, setOpen, darkMode, documentData, allDocuments }) {
  const [currentDoc, setCurrentDoc] = useState(documentData);
  const [loading, setLoading] = useState(false);

  // Update current document when documentData changes
  useEffect(() => {
    if (documentData) {
      setCurrentDoc(documentData);
    }
  }, [documentData]);

  // Navigate to the previous document in the list
  const goToPrevious = () => {
    if (!allDocuments || allDocuments.length <= 1) return;
    
    const currentIndex = allDocuments.findIndex(doc => doc.id === currentDoc.id);
    if (currentIndex > 0) {
      setCurrentDoc(allDocuments[currentIndex - 1]);
    } else {
      // Loop to the end if at the beginning
      setCurrentDoc(allDocuments[allDocuments.length - 1]);
    }
  };

  // Navigate to the next document in the list
  const goToNext = () => {
    if (!allDocuments || allDocuments.length <= 1) return;
    
    const currentIndex = allDocuments.findIndex(doc => doc.id === currentDoc.id);
    if (currentIndex < allDocuments.length - 1) {
      setCurrentDoc(allDocuments[currentIndex + 1]);
    } else {
      // Loop to the beginning if at the end
      setCurrentDoc(allDocuments[0]);
    }
  };

  // Copy content to clipboard
  const copyToClipboard = () => {
    const contentToCopy = `${currentDoc.title}\n\n${currentDoc.description}\n\n${currentDoc.content}`;
    
    navigator.clipboard.writeText(contentToCopy)
      .then(() => {
        toast.success("Dokümantasyon içeriği kopyalandı");
      })
      .catch(err => {
        console.error("Kopyalama başarısız:", err);
        toast.error("İçerik kopyalanamadı");
      });
  };

  // Get appropriate icon for the document
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "FileText": return <FileText className="h-6 w-6 mr-2 text-blue-500" />;
      case "BookOpen": return <BookOpen className="h-6 w-6 mr-2 text-blue-500" />;
      case "Info": return <Info className="h-6 w-6 mr-2 text-blue-500" />;
      default: return <FileText className="h-6 w-6 mr-2 text-blue-500" />;
    }
  };

  // If no document is selected, show a placeholder
  if (!currentDoc) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className={`max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}
        >
          <DialogHeader className="px-6 py-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold flex items-center">
              <FileText className="h-5 w-5 mr-2" /> Dokümantasyon
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 text-center">
            <p>Lütfen görüntülemek için bir dokümantasyon seçin.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Generate content for the documentation
  const generateContent = () => {
    // This is where you'd fetch the content from an API or database
    // For now, we'll generate some placeholder content based on the document title
    
    const contentSections = [
      {
        title: "Genel Bakış",
        content: `${currentDoc.title}, PUTman uygulamasının en önemli özelliklerinden biridir. Bu belge, ${currentDoc.title.toLowerCase()} hakkında detaylı bilgi sağlar ve bu özelliği kullanmanıza yardımcı olur.`
      },
      {
        title: "Nasıl Kullanılır",
        content: `${currentDoc.title} özelliğini kullanmak için aşağıdaki adımları izleyin:\n\n1. Ana menüden ilgili bölüme gidin\n2. Gerekli parametreleri ayarlayın\n3. İşlemi tamamlamak için ekrandaki talimatları izleyin`
      },
      {
        title: "Örnekler",
        content: "Aşağıda bu özelliğin kullanımına ilişkin birkaç örnek bulabilirsiniz:\n\n```\n// Örnek kod veya kullanım\nfetch('/api/endpoint')\n  .then(response => response.json())\n  .then(data => console.log(data));\n```"
      },
      {
        title: "İpuçları ve En İyi Uygulamalar",
        content: "- Büyük veri kümeleriyle çalışırken performans için sayfalama kullanın\n- Güvenlik için her zaman kimlik doğrulama bilgilerinizi gizli tutun\n- Yaptığınız değişiklikleri düzenli olarak kaydedin"
      },
      {
        title: "Sorun Giderme",
        content: "Yaygın sorunlar ve çözümleri:\n\n- **Hata: 401 Unauthorized** - API anahtarınızı kontrol edin\n- **Bağlantı Hatası** - Ağ ayarlarınızı ve proxy yapılandırmanızı kontrol edin\n- **Zaman Aşımı** - Büyük istekler için zaman aşımı süresini artırın"
      }
    ];

    return (
      <div className="space-y-6">
        {contentSections.map((section, index) => (
          <div key={index} className="mb-6">
            <h3 className={`text-xl font-semibold mb-3 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              {section.title}
            </h3>
            <div className={`${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-pre-line`}>
              {section.content.includes("```") ? (
                <>
                  {section.content.split("```").map((part, idx) => (
                    idx % 2 === 0 ? (
                      <div key={idx} className="whitespace-pre-line">{part}</div>
                    ) : (
                      <pre key={idx} className={`p-4 rounded-md my-4 overflow-auto font-mono text-sm ${darkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-800"}`}>
                        {part}
                      </pre>
                    )
                  ))}
                </>
              ) : (
                section.content
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={`max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <DialogHeader className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold flex items-center">
              {getIconComponent(currentDoc.iconName)}
              <span>{currentDoc.title}</span>
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {currentDoc.description}
          </p>
          <div className={`mt-2 text-xs px-2 py-1 rounded inline-block ${darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
            {currentDoc.category}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-240px)]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            generateContent()
          )}
        </ScrollArea>

        <DialogFooter className={`px-6 py-4 border-t flex justify-between ${darkMode ? "border-gray-700 bg-gray-700/30" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={!allDocuments || allDocuments.length <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={!allDocuments || allDocuments.length <= 1}
            >
              Sonraki <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            <Copy className="h-4 w-4 mr-1" /> Kopyala
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentationDetailModal;
export { DocumentationDetailModal };