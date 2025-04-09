"use client";

import { useState } from "react";
import ApiTester from "@/components/api-tester/ApiTester";


export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <ApiTester />
    </div>
  );
}
