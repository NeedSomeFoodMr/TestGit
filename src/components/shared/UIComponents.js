// src/components/shared/UIComponents.js
import React, { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  Terminal,
  Copy,
  X,
  Server,
} from "lucide-react";
import { getScrollbarClass } from "./Theme";

export const ToastContainer = ({ toasts, removeToast, isDark }) => (
  <div className="fixed top-6 right-6 z-[600] flex flex-col gap-3 pointer-events-none">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        onClick={() => removeToast(toast.id)}
        className={`pointer-events-auto w-96 flex items-start gap-4 px-5 py-4 shadow-2xl border cursor-pointer animate-in slide-in-from-right-10 fade-in ${
          isDark
            ? "bg-[#14161B] border-[#272A34] text-white shadow-black/50"
            : "bg-white border-gray-200 text-gray-900 shadow-xl"
        }`}
      >
        <div className="mt-0.5">
          {toast.type === "success" && (
            <CheckCircle size={18} className="text-green-500" />
          )}
          {toast.type === "error" && (
            <AlertTriangle size={18} className="text-red-500" />
          )}
          {toast.type === "info" && (
            <Info size={18} className="text-blue-500" />
          )}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-0.5">
            {toast.title}
          </p>
          <p
            className={`text-[11px] leading-relaxed ${
              isDark ? "opacity-60" : "opacity-70"
            }`}
          >
            {toast.message}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export const LogViewer = ({ isOpen, onClose, logData, isDark }) => {
  if (!isOpen) return null;
  const theme = {
    modal: isDark
      ? "bg-[#0A0A0A] border-gray-800"
      : "bg-white border-gray-200 shadow-2xl",
    header: isDark ? "bg-[#111] border-gray-800" : "bg-gray-50 border-gray-200",
    textPrimary: isDark ? "text-gray-200" : "text-gray-900",
    content: isDark ? "bg-[#050505]" : "bg-gray-50",
    codeText: isDark ? "text-green-500" : "text-green-700",
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-3xl border overflow-hidden flex flex-col max-h-[600px] ${theme.modal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${theme.header}`}
        >
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-blue-500" />
            <span className={`text-sm font-medium ${theme.textPrimary}`}>
              Raw Log: beacon-proxy-x992
            </span>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div
          className={`p-0 overflow-auto flex-1 ${
            theme.content
          } ${getScrollbarClass(isDark)}`}
        >
          <pre
            className={`p-4 text-xs font-mono leading-6 overflow-x-auto ${theme.codeText}`}
          >
            {JSON.stringify(logData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export const ProvisionModal = ({ node, onClose, colors, isDark, addToast }) => {
  const [activeTab, setActiveTab] = useState("auto");
  const [status, setStatus] = useState("idle");

  const handleDeploy = () => {
    setStatus("deploying");
    setTimeout(() => {
      setStatus("success");
      addToast(
        "success",
        "Provisioned",
        `Node ${node.ip} attached successfully.`
      );
      setTimeout(onClose, 1000);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl ${colors.card} border ${colors.border} shadow-2xl flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-6 py-4 border-b ${colors.border} flex justify-between items-center ${colors.headerBg}`}
        >
          <h2 className="text-lg font-bold">Provision Beacon Proxy</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-0 flex h-[350px]">
          <div className={`w-48 border-r ${colors.border} p-4 space-y-1`}>
            <button
              onClick={() => setActiveTab("auto")}
              className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider border rounded ${
                activeTab === "auto"
                  ? "border-blue-500 bg-blue-500/10 text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              } transition-all`}
            >
              Automatic
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider border rounded ${
                activeTab === "manual"
                  ? "border-blue-500 bg-blue-500/10 text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              } transition-all`}
            >
              Manual Injection
            </button>
          </div>
          <div className="flex-1 p-6 flex flex-col relative">
            <div className="mb-4">
              <div className="text-xs font-bold uppercase opacity-50 mb-1">
                Target Workload
              </div>
              <div className="font-mono text-sm font-bold flex items-center gap-2">
                <Server size={14} /> {node.name}{" "}
                <span className="opacity-50">({node.ip})</span>
              </div>
            </div>
            {activeTab === "auto" ? (
              <div className="flex-1 flex flex-col">
                <p className="text-xs mb-4 leading-relaxed opacity-70">
                  Deploy the Beacon Sidecar via the Operator. This will require
                  a rolling restart.
                </p>
                <div
                  className={`flex-1 p-4 border rounded ${
                    colors.border
                  } font-mono text-[10px] ${
                    isDark
                      ? "bg-[#0A0A0A] text-green-500"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  $ helm upgrade --install beacon-sidecar ./charts/beacon \
                  <br />
                  &nbsp;&nbsp;--set target.ip={node.ip} \<br />
                  &nbsp;&nbsp;--set policy.mode=enforce
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <p className="text-xs mb-4 leading-relaxed opacity-70">
                  Add the following annotation to your Kubernetes Deployment
                  YAML.
                </p>
                <div
                  className={`flex-1 p-4 border rounded ${
                    colors.border
                  } font-mono text-[10px] ${
                    isDark
                      ? "bg-[#0A0A0A] text-purple-400"
                      : "bg-gray-100 text-purple-700"
                  }`}
                >
                  metadata:
                  <br />
                  &nbsp;&nbsp;annotations:
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;beacon.io/inject: "true"
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;beacon.io/policy-group: "finance"
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleDeploy}
                disabled={status === "deploying" || status === "success"}
                className={`px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider text-white transition-all ${
                  status === "success"
                    ? "bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {status === "idle" && "Deploy Sidecar"}
                {status === "deploying" && "Injecting..."}
                {status === "success" && "Deployed!"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
