"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAxios } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function SearchParamsHandler({ setSharedData, openLoginModal }) {
  const router = useRouter();
  const searchParams = useSearchParams(); // useSearchParams hook'u burada kullanılıyor

  // Effect to handle shared data from URL
  useEffect(() => {
    const shareId = searchParams.get('shareId');
    if (shareId) {
      const fetchSharedData = async () => {
        try {
          // Assuming auth is not strictly required to fetch shared data,
          // but using authAxios for consistency if needed later.
          // If shared data should be public, use a regular axios instance.
          const response = await authAxios.get(`SharedData/${shareId}`);
          setSharedData(response.data);
          // Clear the shareId from the URL after fetching
          router.replace('/');
        } catch (error) {
          console.error("Failed to fetch shared data:", error);
          if (error.response) {
            if (error.response.status === 404) {
              toast.error("Paylaşılan veri bulunamadı.");
            } else if (error.response.status === 401) {
              // If unauthorized, prompt user to login
              toast.info("Paylaşılan veriye erişmek için lütfen giriş yapın.");
              openLoginModal(); // Open login modal
            } else {
              toast.error("Paylaşılan veri yüklenemedi.", { description: error.message });
            }
          } else {
            toast.error("Paylaşılan veri yüklenemedi.", { description: error.message });
          }
          setSharedData(null); // Clear shared data on error
          // Only replace URL if not a 401 error, so user can try logging in and the shareId is still in the URL
          if (error.response?.status !== 401) {
            router.replace('/'); // Clear the shareId from the URL on error
          }
        }
      };
      fetchSharedData();
    }
  }, [searchParams, router, setSharedData, openLoginModal]); // Bağımlılıkları doğru bir şekilde belirtin

  return null; // Bu bileşen herhangi bir UI görüntülemez, sadece yan etki için kullanılır
} 