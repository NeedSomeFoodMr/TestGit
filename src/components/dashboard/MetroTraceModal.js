import React, { useState } from "react";
import {
  X,
  Activity,
  User,
  Lock,
  Cpu,
  FileText,
  ShieldAlert,
  Ban,
  CloudOff,
  Undo2,
  CheckSquare,
  ArrowUpRight,
  Code,
  Database,
} from "lucide-react";
import { LogViewer } from "../shared/UIComponents";

const MetroTraceModal = ({
  log,
  onClose,
  colors,
  isDark,
  onRedirectToPolicy,
  onResolveLog,
  onUnresolveLog,
  onEscalate,
}) => {
  const [selectedStepId, setSelectedStepId] = useState("dlp_check");
  const [showLogs, setShowLogs] = useState(false);
  const isAlert = log.type === "ALERT";
  const traceSteps = [
    {
      id: "init",
      title: "Request Initiated",
      icon: User,
      status: "pass",
      time: "0ms",
      detail: {
        type: "Source",
        content: 'Agent "n8n_billing_bot" initiated request via gRPC/HTTP2.',
      },
    },
    {
      id: "mtls",
      title: "mTLS Handshake",
      icon: Lock,
      status: "pass",
      time: "5ms",
      detail: {
        type: "Crypto",
        content: "TLS 1.3 Established. Cipher: AES_256_GCM.",
      },
    },
    {
      id: "spiffe",
      title: "SPIFFE Attestation",
      icon: Cpu,
      status: "pass",
      time: "8ms",
      detail: {
        type: "Zero Trust",
        content: "SVID Verified: spiffe://acme/billing. Trust Bundle OK.",
      },
    },
    {
      id: "rbac_global",
      title: "Global RBAC Check",
      icon: FileText,
      status: "pass",
      time: "11ms",
      detail: {
        type: "Policy",
        content: 'Role "billing_bot" allowed on "/api/v1/*".',
      },
    },
    {
      id: "dlp_check",
      title: isAlert ? "Identity Warning" : "Data Guardrails",
      icon: isAlert ? ShieldAlert : Ban,
      status: "fail",
      time: "42ms",
      detail: {
        type: "Enforcement Rule",
        content: log.reason,
        code: isAlert
          ? "warn if identity.trust_level < 5"
          : 'deny if request.body contains "cc_pattern"',
      },
    },
    {
      id: "upstream_api",
      title: "External API Call",
      icon: CloudOff,
      status: "blocked",
      time: "--",
      detail: {
        type: "Target",
        content: "Unreachable due to policy enforcement.",
      },
    },
  ];
  const selectedStep =
    traceSteps.find((s) => s.id === selectedStepId) ||
    traceSteps[traceSteps.length - 2];
  const getStatusBadge = () => {
    if (selectedStep.status === "pass")
      return { text: "SUCCESS", color: "text-green-500" };
    if (selectedStep.status === "fail")
      return {
        text: isAlert ? "WARNING" : "BLOCKED",
        color: isAlert ? "text-amber-500" : "text-red-500",
      };
    if (selectedStep.status === "blocked")
      return { text: "BLOCKED", color: "text-gray-400" };
    return { text: "PENDING", color: "text-gray-500" };
  };
  const badge = getStatusBadge();

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className={`w-full max-w-6xl ${colors.card} border ${colors.border} shadow-2xl flex flex-col h-[85vh] rounded-xl overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`px-6 py-4 border-b ${colors.border} flex justify-between items-center ${colors.headerBg}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-full ${
                  isAlert
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                  Trace Analysis{" "}
                  <span className="text-xs font-mono opacity-50 px-2 py-0.5 border border-gray-500/30 rounded-full">
                    {log.id}
                  </span>
                </h2>
                <p className={`text-xs ${colors.textSecondary}`}>
                  {traceSteps.length} Steps • Duration: 42ms • Node: SG_PROD_01
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {log.isResolved ? (
                <button
                  onClick={() => {
                    onUnresolveLog(log.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 transition-colors"
                >
                  <Undo2 size={14} /> Mark Unresolved
                </button>
              ) : (
                <button
                  onClick={() => {
                    onResolveLog(log.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                >
                  <CheckSquare size={14} /> Mark Resolved
                </button>
              )}
              <div
                className={`w-px h-6 ${colors.border} bg-current opacity-20`}
              ></div>
              <button
                onClick={() => {
                  onEscalate();
                  onClose();
                }}
                className="px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors"
              >
                <ArrowUpRight size={14} /> Escalate Incident
              </button>
              <button
                onClick={() => setShowLogs(true)}
                className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${colors.textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
              >
                <FileText size={14} /> View Raw Logs
              </button>
              <div
                className={`w-px h-6 ${colors.border} bg-current opacity-20`}
              ></div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full ${colors.hover}`}
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div
              className={`w-1/3 h-full overflow-y-auto border-r ${
                colors.border
              } ${isDark ? "bg-[#0B0C10]" : "bg-slate-50"}`}
            >
              <div className="p-6 relative min-h-full">
                <div className="relative z-10 flex flex-col gap-0">
                  {traceSteps.map((step, index) => {
                    const isSelected = selectedStepId === step.id;
                    const isLast = index === traceSteps.length - 1;
                    let statusColor = isDark
                      ? "bg-[#15171C] border-green-500 text-green-500"
                      : "bg-white border-green-500 text-green-500";
                    if (step.status === "fail")
                      statusColor = isAlert
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-red-500 border-red-500 text-white";
                    else if (step.status === "blocked")
                      statusColor = isDark
                        ? "bg-gray-800 border-gray-600 text-gray-500"
                        : "bg-white border-gray-300 text-gray-400";
                    const lineColor = isDark ? "bg-gray-800" : "bg-gray-300";
                    return (
                      <div
                        key={step.id}
                        onClick={() => setSelectedStepId(step.id)}
                        className={`relative flex gap-6 group cursor-pointer transition-colors duration-200 ${
                          !isLast ? "pb-10" : ""
                        }`}
                      >
                        {!isLast && (
                          <div
                            className={`absolute left-[1.5rem] top-12 bottom-0 w-0.5 -ml-px ${lineColor} -z-10`}
                          />
                        )}
                        <div
                          className={`w-12 h-12 flex items-center justify-center shrink-0 z-10 transition-transform rounded-full ${statusColor} ${
                            isSelected ? "scale-110" : "group-hover:scale-105"
                          }`}
                        >
                          <step.icon size={18} strokeWidth={3} />
                        </div>
                        <div
                          className={`flex-1 p-3 border transition-all h-fit self-center ${
                            isSelected
                              ? isDark
                                ? "bg-[#1E2128] border-blue-500/50"
                                : "bg-white border-blue-500 shadow-sm"
                              : `border-transparent ${
                                  isDark
                                    ? "hover:bg-white/5"
                                    : "hover:bg-black/5"
                                }`
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span
                              className={`text-xs font-bold uppercase tracking-wider ${
                                step.status === "fail"
                                  ? isAlert
                                    ? "text-amber-500"
                                    : "text-red-500"
                                  : step.status === "blocked"
                                  ? "text-gray-500"
                                  : isSelected
                                  ? colors.textPrimary
                                  : colors.textSecondary
                              }`}
                            >
                              {step.title}
                            </span>
                            <span className="text-[10px] font-mono opacity-50 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
                              {step.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div
              className={`w-2/3 h-full overflow-y-auto ${colors.card} flex flex-col p-8`}
            >
              <div className="mb-8 flex items-start gap-4 pb-6 border-b border-dashed border-gray-700/50">
                <div
                  className={`p-4 rounded-full ${
                    selectedStep.status === "blocked"
                      ? "bg-gray-800 text-gray-500"
                      : selectedStep.status === "fail"
                      ? isAlert
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-red-500/10 text-red-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  <selectedStep.icon size={32} />
                </div>
                <div>
                  <h3
                    className={`text-2xl font-bold mb-1 ${
                      selectedStep.status === "blocked"
                        ? "text-gray-400"
                        : colors.textPrimary
                    }`}
                  >
                    {selectedStep.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono opacity-60">
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        isDark
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-gray-100"
                      }`}
                    >
                      ID: {selectedStep.id}
                    </span>
                    <span>Duration: {selectedStep.time}</span>
                    <span className={`font-bold uppercase ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-8 flex-1">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3 flex items-center gap-2">
                    <FileText size={14} /> Execution Details
                  </h4>
                  <div
                    className={`p-6 border ${colors.border} ${
                      isDark ? "bg-[#0B0C10]" : "bg-slate-50"
                    }`}
                  >
                    <p
                      className={`text-sm leading-relaxed ${
                        selectedStep.status === "blocked"
                          ? "text-gray-300 italic"
                          : colors.textPrimary
                      }`}
                    >
                      <span className="font-bold not-italic">
                        {selectedStep.detail.type}:
                      </span>{" "}
                      {selectedStep.detail.content}
                    </p>
                  </div>
                </div>
                {selectedStep.detail.code && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3 flex items-center gap-2">
                      <Code size={14} /> Enforcement Logic
                    </h4>
                    <div
                      className={`p-5 border ${
                        isAlert
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-red-500/30 bg-red-500/5"
                      } font-mono text-xs leading-relaxed overflow-x-auto`}
                    >
                      {selectedStep.detail.code}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3 flex items-center gap-2">
                    <Database size={14} /> Node Context
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-5 border ${colors.border} flex flex-col gap-2`}
                    >
                      <span className="text-[10px] uppercase opacity-50 tracking-wider font-bold">
                        Service Version
                      </span>
                      <span className="text-base font-mono font-bold">
                        v2.4.1-stable
                      </span>
                    </div>
                    <div
                      className={`p-5 border ${colors.border} flex flex-col gap-2`}
                    >
                      <span className="text-[10px] uppercase opacity-50 tracking-wider font-bold">
                        Cluster Region
                      </span>
                      <span className="text-base font-mono font-bold">
                        ap-southeast-1
                      </span>
                    </div>
                    <div
                      className={`p-5 border ${colors.border} flex flex-col gap-2`}
                    >
                      <span className="text-[10px] uppercase opacity-50 tracking-wider font-bold">
                        Pod ID
                      </span>
                      <span className="text-base font-mono font-bold">
                        beacon-proxy-x992
                      </span>
                    </div>
                    <div
                      className={`p-5 border ${colors.border} flex flex-col gap-2`}
                    >
                      <span className="text-[10px] uppercase opacity-50 tracking-wider font-bold">
                        Protocol
                      </span>
                      <span className="text-base font-mono font-bold">
                        HTTP/2 (gRPC)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-dashed border-gray-700/50 flex gap-3">
                <button
                  onClick={() => setShowLogs(true)}
                  className={`px-4 py-3 w-full text-xs font-bold uppercase tracking-wider border ${colors.border} ${colors.hover} transition-colors`}
                >
                  View Raw Logs
                </button>
                {selectedStep.status === "fail" && (
                  <button
                    onClick={() => {
                      onRedirectToPolicy();
                      onClose();
                    }}
                    className="px-4 py-3 w-full text-xs font-bold uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
                  >
                    Go to Policy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <LogViewer
        isOpen={showLogs}
        onClose={() => setShowLogs(false)}
        logData={{ ...log, steps: traceSteps }}
        isDark={isDark}
      />
    </>
  );
};

export default MetroTraceModal;
