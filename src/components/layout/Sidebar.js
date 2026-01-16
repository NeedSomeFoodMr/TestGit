import React from "react";
import {
  Shield,
  LayoutDashboard, // Changed from LayoutGrid for specific Dashboard icon
  Activity, // For Runtime Live
  Network, // For Posture Map (better than Shield for graph)
  FileCode, // For Policy Engine
  CheckSquare, // For Remediation
  Sun,
  Moon,
  Hexagon, // Optional: For the Logo
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, isDark, setIsDark, colors }) => (
  <div
    className={`w-64 ${colors.sidebar} h-screen fixed left-0 top-0 flex flex-col border-r ${colors.border} z-50`}
  >
    {/* --- HEADER --- */}
    <div className="p-6 flex items-center gap-3">
      <div
        className={`w-8 h-8 ${
          isDark ? "bg-white text-black" : "bg-black text-white"
        } flex items-center justify-center rounded-sm`}
      >
        <Hexagon
          size={18}
          strokeWidth={3}
          className="text-blue-500"
          fill="currentColor"
          fillOpacity={0.1}
        />
      </div>
      <span className="text-xl font-bold tracking-tight uppercase">Beacon</span>
    </div>

    {/* --- NAVIGATION --- */}
    <nav className="flex-1 px-0 space-y-px mt-6">
      {[
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }, // V76 Executive View
        { id: "runtime", label: "Runtime Live", icon: Activity }, // V75 Kinetic Map
        { id: "posture", label: "Posture Map", icon: Network }, // V59 Graph
        { id: "policies", label: "Policy Engine", icon: FileCode }, // V74 Logic Builder
        { id: "remediation", label: "Remediation", icon: CheckSquare }, // V60 Kanban
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-l-2 ${
            activeTab === item.id
              ? isDark
                ? "bg-[#1E2128] text-white border-blue-500"
                : "bg-gray-100 text-gray-900 border-blue-600"
              : `border-transparent opacity-60 hover:opacity-100 hover:bg-white/5 ${colors.textSecondary}`
          }`}
        >
          <item.icon size={18} />
          {item.label}
        </button>
      ))}
    </nav>

    {/* --- FOOTER / THEME TOGGLE --- */}
    <div className={`p-6 mt-auto border-t ${colors.border}`}>
      <button
        onClick={() => setIsDark(!isDark)}
        className={`w-full flex items-center justify-between px-4 py-3 border ${colors.border} ${colors.hover} transition-colors`}
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </div>
      </button>
    </div>
  </div>
);

export default Sidebar;
