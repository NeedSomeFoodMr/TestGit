import React from "react";
import { X } from "lucide-react";

const HistoryModal = ({ historyItem, onClose, isDark }) => {
  if (!historyItem) return null;
  const theme = isDark
    ? { bg: "bg-[#0A0A0A]", border: "border-gray-800", text: "text-gray-300" }
    : { bg: "bg-white", border: "border-gray-200", text: "text-gray-900" };
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl border rounded-lg overflow-hidden shadow-2xl ${theme.bg} ${theme.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${theme.border}`}
        >
          <div>
            <h3
              className={`text-sm font-bold uppercase tracking-wider ${theme.text}`}
            >
              Version: {historyItem.version}
            </h3>
            <p className="text-xs text-gray-500">
              Committed by {historyItem.user} on {historyItem.date}
            </p>
          </div>
          <button onClick={onClose}>
            <X
              size={18}
              className="text-gray-500 hover:text-blue-500 transition-colors"
            />
          </button>
        </div>
        <div className="p-0 overflow-hidden relative">
          <div
            className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20`}
          />
          <textarea
            readOnly
            defaultValue={`package beacon.policies.archive\n\n# Snapshot ${historyItem.version}\n# Author: ${historyItem.user}\n\ndeny[msg] {\n  # Logic frozen at ${historyItem.date}\n  input.method == "POST"\n}`}
            className={`w-full h-64 p-6 font-mono text-xs resize-none outline-none ${
              isDark ? "bg-[#050505] text-gray-400" : "bg-gray-50 text-gray-600"
            }`}
          />
        </div>
        <div
          className={`p-4 border-t flex justify-end gap-3 ${theme.border} ${
            isDark ? "bg-[#111]" : "bg-gray-50"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-bold uppercase border ${theme.border} hover:opacity-70 transition-opacity`}
          >
            Close
          </button>
          <button className="px-4 py-2 text-xs font-bold uppercase bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20">
            Restore This Version
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
