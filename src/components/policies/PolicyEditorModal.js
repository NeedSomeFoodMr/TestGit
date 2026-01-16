import React, { useState } from "react";
import { X, Edit3, Lock, CheckCircle, ArrowLeftRight } from "lucide-react";

const PolicyEditorModal = ({ onClose, colors, isDark, addToast }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [code, setCode] = useState(
    `package beacon.policies.dlp\n\n# Deny any request containing Credit Card patterns\ndeny[msg] {\n  input.method == "POST"\n  regex.match("\\\\b(?:4[0-9]{12}(?:[0-9]{3})?)\\\\b", input.body)\n\n  # EXCEPTION: Finance Bot Allowed\n  not input.subject.id == "spiffe://acme/n8n_billing_bot"\n\n  msg := "Blocked: PCI-DSS Violation (CC Pattern)"\n}`
  );
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast(
        "success",
        "Policy Updated",
        'Exception added for "n8n_billing_bot".'
      );
      onClose();
    }, 1500);
  };
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-5xl ${colors.card} border ${colors.border} shadow-2xl flex flex-col overflow-hidden h-[85vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-6 py-4 border-b ${colors.border} flex justify-between items-center ${colors.headerBg}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Edit3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight">
                Policy Remediation
              </h2>
              <p className={`text-xs ${colors.textSecondary}`}>
                Adding Exception to: pol_dlp_cc_block.rego
              </p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 ${colors.hover}`}>
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div
            className={`w-1/2 flex flex-col border-r ${colors.border} ${
              isDark ? "bg-[#050505]" : "bg-gray-100"
            }`}
          >
            <div
              className={`p-3 border-b ${colors.border} flex justify-between items-center opacity-50`}
            >
              <span className="text-[10px] font-bold uppercase flex items-center gap-2">
                <Lock size={10} /> Live Version
              </span>
              <span className="text-[10px] font-mono">LOCKED</span>
            </div>
            <div className="flex-1 p-6 flex overflow-y-auto opacity-80 grayscale pointer-events-none select-none">
              <div
                className={`select-none text-right pr-4 opacity-30 font-mono text-[10px] leading-relaxed pt-[2px] ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <div className="font-mono text-xs space-y-1 leading-relaxed w-full">
                <p>
                  <span className="text-purple-500">package</span>{" "}
                  beacon.policies.dlp
                </p>
                <p className="text-gray-500 italic">
                  # Deny requests with Credit Card patterns
                </p>
                <br />
                <p>
                  <span className="text-blue-500">deny</span>[msg] &#123;
                </p>
                <p className="pl-4">
                  input.method == <span className="text-green-500">"POST"</span>
                </p>
                <p className="pl-4">
                  regex.match(
                  <span className="text-green-500">"\\b(?:4[0-9]{12})\\b"</span>
                  , input.body)
                </p>
                <br />
                <br />
                <br />
                <p className="pl-4">
                  msg :={" "}
                  <span className="text-green-500">
                    "Blocked: PCI-DSS Violation"
                  </span>
                </p>
                <p>&#125;</p>
              </div>
            </div>
          </div>
          <div className="w-1/2 flex flex-col bg-inherit relative">
            <div
              className={`p-3 border-b ${
                colors.border
              } flex justify-between items-center ${
                isDark ? "bg-blue-500/10" : "bg-blue-50"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase flex items-center gap-2 ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                <Edit3 size={10} /> Working Draft
              </span>
            </div>
            <div
              className={`flex-1 flex overflow-y-auto ${
                isDark ? "bg-[#14161B]" : "bg-white"
              }`}
            >
              <div className="p-6">
                <div
                  className={`select-none text-right pr-4 opacity-30 font-mono text-[10px] leading-relaxed pt-[2px] ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`flex-1 p-6 pl-0 font-mono text-xs leading-relaxed resize-none outline-none bg-transparent ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
                spellCheck="false"
              />
            </div>
            <div
              className={`p-4 border-t ${colors.border} flex justify-between items-center gap-4 ${colors.headerBg}`}
            >
              <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                <CheckCircle size={12} className="text-green-500" /> Syntax
                Check Passed
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold uppercase flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  "Deploying..."
                ) : (
                  <>
                    <ArrowLeftRight size={14} /> Commit Change
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyEditorModal;
