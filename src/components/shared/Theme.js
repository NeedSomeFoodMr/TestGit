// src/components/shared/Theme.js

export const getScrollbarClass = (isDark) =>
  isDark
    ? "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#272A34] hover:[&::-webkit-scrollbar-thumb]:bg-[#323642]"
    : "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300";

export const getThemeColors = (isDark) => ({
  bg: isDark ? "bg-[#0B0C10]" : "bg-[#F3F4F6]",
  card: isDark ? "bg-[#14161B]" : "bg-white",
  sidebar: isDark ? "bg-[#0B0C10]" : "bg-white",
  border: isDark ? "border-[#272A34]" : "border-[#E5E7EB]",
  textPrimary: isDark ? "text-white" : "text-gray-900",
  textSecondary: isDark ? "text-gray-400" : "text-gray-500",
  hover: isDark ? "hover:bg-[#1E2128]" : "hover:bg-gray-50",
  divider: isDark ? "divide-[#272A34]" : "divide-[#E5E7EB]",
  headerBg: isDark ? "bg-[#14161B]" : "bg-white",
});

export const policyImpactColor = (impact) => {
  if (impact === "Critical")
    return "text-red-500 border-red-500/30 bg-red-500/10";
  if (impact === "High")
    return "text-orange-500 border-orange-500/30 bg-orange-500/10";
  if (impact === "Medium")
    return "text-blue-500 border-blue-500/30 bg-blue-500/10";
  return "text-gray-500 border-gray-500/30 bg-gray-500/10";
};

export const policyStatusColor = (status) => {
  if (status === "active")
    return "text-green-500 border-green-500/30 bg-green-500/10";
  if (status === "monitor")
    return "text-blue-500 border-blue-500/30 bg-blue-500/10";
  return "text-gray-500 border-gray-500/30 bg-gray-500/10";
};
