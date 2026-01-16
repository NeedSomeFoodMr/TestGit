import React, { useState } from "react";

// --- FIXED IMPORT PATH ---
// Was: "./components/Sidebar"
// Now: Points to the layout folder
import Sidebar from "./components/layout/Sidebar";

// --- IMPORT YOUR PAGES ---
import DashboardPage from "./pages/DashboardPage"; // V76
import RuntimePage from "./pages/RuntimePage"; // V75
import PoliciesPage from "./pages/PoliciesPage"; // V74

// --- PLACEHOLDERS ---
const PosturePage = ({ isDark }) => (
  <div
    className={`flex items-center justify-center h-full ${
      isDark ? "text-gray-500" : "text-gray-400"
    }`}
  >
    <div className="text-center">
      <h2 className="text-2xl font-bold uppercase tracking-widest opacity-50">
        Posture Map
      </h2>
      <p className="text-xs mt-2">Attack Path Visualization Engine</p>
    </div>
  </div>
);

const RemediationPage = ({ isDark }) => (
  <div
    className={`flex items-center justify-center h-full ${
      isDark ? "text-gray-500" : "text-gray-400"
    }`}
  >
    <div className="text-center">
      <h2 className="text-2xl font-bold uppercase tracking-widest opacity-50">
        Remediation
      </h2>
      <p className="text-xs mt-2">Kanban Workflow Board</p>
    </div>
  </div>
);

const App = () => {
  // --- GLOBAL STATE ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDark, setIsDark] = useState(true);

  // --- THEME CONFIG ---
  const colors = {
    sidebar: isDark ? "bg-[#0a0a0a]" : "bg-white",
    border: isDark ? "border-gray-800" : "border-gray-200",
    text: isDark ? "text-gray-100" : "text-gray-900",
    textSecondary: isDark ? "text-gray-400" : "text-gray-500",
    hover: isDark ? "hover:bg-white/5" : "hover:bg-gray-100",
  };

  // --- PAGE ROUTER ---
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage isDark={isDark} />;
      case "runtime":
        return <RuntimePage isDark={isDark} />;
      case "policies":
        return <PoliciesPage isDark={isDark} />;
      case "posture":
        return <PosturePage isDark={isDark} />;
      case "remediation":
        return <RemediationPage isDark={isDark} />;
      default:
        return <DashboardPage isDark={isDark} />;
    }
  };

  return (
    <div
      className={`flex w-full h-screen overflow-hidden ${
        isDark ? "bg-[#050505]" : "bg-gray-50"
      }`}
    >
      {/* 1. SIDEBAR (Fixed Left) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        colors={colors}
      />

      {/* 2. MAIN CONTENT AREA (Flex Grow) */}
      <div className="flex-1 ml-64 h-full relative">{renderContent()}</div>
    </div>
  );
};

export default App;
