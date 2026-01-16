import React from "react";
import {
  Activity,
  Network,
  Globe,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  CheckCircle,
  Ban,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { LatencyPulse } from "../components/dashboard/LatencyPulse";
import { getScrollbarClass } from "../components/shared/Theme";

const RuntimePage = ({
  isDark,
  colors,
  logs,
  auditRows,
  handleAuditAction,
  setProvisionNode,
  setSelectedLog,
}) => {
  const scrollbarClass = getScrollbarClass(isDark);

  return (
    // FIXED: Added p-8 to prevent touching the top header
    <div
      className={`p-8 flex flex-col gap-8 w-full max-w-full h-full overflow-y-auto ${scrollbarClass}`}
    >
      {/* ROW 1: KPI Cards */}
      <div className="grid grid-cols-4 gap-6 h-32 shrink-0">
        <div
          className={`p-6 border ${colors.border} ${colors.card} flex flex-col justify-between relative overflow-hidden`}
        >
          <div className="flex justify-between items-start mb-2 relative z-20">
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">
              System Latency
            </p>
            <Activity size={16} className="text-green-500" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 opacity-50">
            <LatencyPulse isDark={isDark} height={60} />
          </div>
          <div className="mt-4 relative z-10">
            <span className="text-2xl font-bold">12ms</span>
            <span className="text-sm opacity-60 ml-1">avg</span>
          </div>
        </div>
        <div
          className={`p-6 border ${colors.border} ${colors.card} flex flex-col justify-between`}
        >
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">
              Throughput
            </p>
            <Network size={16} className="text-blue-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold">1.2</span>
            <span className="text-sm opacity-60 ml-1">GB/s</span>
          </div>
        </div>
        <div
          className={`p-6 border ${colors.border} ${colors.card} flex flex-col justify-between`}
        >
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">
              Requests
            </p>
            <Globe size={16} className="text-purple-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold">45.2k</span>
            <span className="text-sm opacity-60 ml-1">/sec</span>
          </div>
        </div>
        <div
          className={`p-6 border ${colors.border} ${colors.card} flex flex-col justify-between`}
        >
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">
              Block Rate
            </p>
            <Shield size={16} className="text-green-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-green-500">0.8%</span>
            <span className="text-sm opacity-60 ml-1">Stable</span>
          </div>
        </div>
      </div>

      {/* ROW 2: Logs & Stats */}
      <div className="grid grid-cols-12 gap-6 h-[500px] shrink-0">
        {/* Logs */}
        <div
          className={`col-span-8 border ${colors.border} ${colors.card} overflow-hidden flex flex-col h-full`}
        >
          <div
            className={`px-6 py-4 border-b ${colors.border} flex justify-between items-center shrink-0`}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              Enforcement Logs
            </h3>
            <button
              className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${colors.textSecondary} hover:text-blue-500 transition-colors`}
            >
              Full History <ChevronRight size={14} />
            </button>
          </div>
          <div
            className={`grid grid-cols-12 px-6 py-3 border-b ${colors.border} text-xs font-bold uppercase tracking-wider ${colors.textSecondary} bg-black/5 dark:bg-white/5 shrink-0`}
          >
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-3">Source Workload</div>
            <div className="col-span-4">Reason</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
          <div
            className={`divide-y ${colors.divider} overflow-y-auto ${scrollbarClass} flex-1`}
          >
            {logs.map((log, i) => (
              <div
                key={i}
                onClick={() => setSelectedLog(log)}
                className={`grid grid-cols-12 px-6 py-3 items-center cursor-pointer ${
                  colors.hover
                } ${log.isResolved ? "opacity-50 grayscale" : ""}`}
              >
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center justify-center w-24 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                      log.isResolved
                        ? "border-green-500/30 text-green-500 bg-green-500/10"
                        : log.type === "BLOCKED"
                        ? "border-red-500/30 text-red-500 bg-red-500/10"
                        : "border-amber-500/30 text-amber-500 bg-amber-500/10"
                    }`}
                  >
                    {log.isResolved ? "Resolved" : log.type}
                  </span>
                </div>
                <div
                  className={`col-span-2 font-mono text-xs opacity-70 ${
                    log.isResolved ? "line-through" : ""
                  }`}
                >
                  {log.time}
                </div>
                <div
                  className={`col-span-3 text-sm font-bold ${colors.textPrimary}`}
                >
                  {log.source}
                </div>
                <div className="col-span-4 text-xs opacity-70 font-mono truncate">
                  {log.reason}
                </div>
                <div className="col-span-1 text-right">
                  <button
                    className={`p-1.5 hover:bg-blue-500 hover:text-white transition-colors ${colors.textSecondary}`}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="col-span-4 flex flex-col gap-6 h-full">
          {/* Alert Severity */}
          <div
            className={`h-[140px] shrink-0 border ${colors.border} ${colors.card} p-5 flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                Alert Severity
              </h3>
              <Clock size={14} className={colors.textSecondary} />
            </div>
            <div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold leading-none">125</span>
                <span
                  className={`text-[10px] uppercase font-bold mb-1 ${colors.textSecondary}`}
                >
                  Active Alerts
                </span>
              </div>
              <div className="w-full h-2 flex overflow-hidden mb-3">
                <div className="bg-red-500 w-[16%]"></div>
                <div className="bg-orange-500 w-[38%]"></div>
                <div className="bg-blue-500 flex-1"></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono opacity-70">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-red-500"></div> Crit: 20
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-orange-500"></div> High: 47
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500"></div> Med: 58
                </span>
              </div>
            </div>
          </div>
          {/* Top Violations */}
          <div
            className={`flex-1 border ${colors.border} ${colors.card} overflow-hidden flex flex-col`}
          >
            <div
              className={`px-6 py-3 border-b ${colors.border} shrink-0 bg-black/5 dark:bg-white/5`}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Top Violated Policies
              </h3>
            </div>
            <div
              className={`p-4 space-y-1 flex-1 overflow-y-auto ${scrollbarClass}`}
            >
              <div className="flex justify-between items-center p-2 hover:bg-white/5 transition-colors group border-b border-dashed border-gray-800 last:border-0">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">PII Leak in Prompt</span>
                  <span className="text-[9px] opacity-40 font-mono">
                    DLP-001
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                    <TrendingUp size={10} /> +12%
                  </span>
                  <span className="text-[10px] font-bold min-w-[24px] text-center">
                    124
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-white/5 transition-colors group border-b border-dashed border-gray-800 last:border-0">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Shadow AI Egress</span>
                  <span className="text-[9px] opacity-40 font-mono">
                    NET-044
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-orange-400 flex items-center gap-0.5">
                    <TrendingUp size={10} /> +5%
                  </span>
                  <span className="text-[10px] font-bold min-w-[24px] text-center">
                    89
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-white/5 transition-colors group border-b border-dashed border-gray-800 last:border-0">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Rate Limit Exceeded</span>
                  <span className="text-[9px] opacity-40 font-mono">
                    OPS-102
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                    <TrendingDown size={10} /> -2%
                  </span>
                  <span className="text-[10px] font-bold min-w-[24px] text-center">
                    45
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-white/5 transition-colors group border-b border-dashed border-gray-800 last:border-0">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Unauthorized Region</span>
                  <span className="text-[9px] opacity-40 font-mono">
                    GEO-552
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                    <Minus size={10} /> 0%
                  </span>
                  <span className="text-[10px] font-bold min-w-[24px] text-center">
                    12
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-white/5 transition-colors group border-b border-dashed border-gray-800 last:border-0">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Suspicious Payload</span>
                  <span className="text-[9px] opacity-40 font-mono">
                    SEC-991
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                    <TrendingUp size={10} /> +1%
                  </span>
                  <span className="text-[10px] font-bold min-w-[24px] text-center">
                    8
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Discovery */}
      <div className="grid grid-cols-2 gap-6 h-[400px] shrink-0 pb-8">
        <div
          className={`border ${colors.border} ${colors.card} flex flex-col h-full overflow-hidden`}
        >
          <div
            className={`px-6 py-4 border-b ${colors.border} flex justify-between items-center shrink-0`}
          >
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Live Audit Pulse
              </h3>
              <p className={`text-[10px] ${colors.textSecondary} mt-0.5`}>
                Real-time decision stream from Proxy nodes
              </p>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">
              <Activity size={12} /> Live
            </div>
          </div>
          <div className={`flex-1 overflow-y-auto ${scrollbarClass}`}>
            <table className="w-full text-left text-xs">
              <tbody className={`divide-y ${colors.divider}`}>
                {auditRows.map((row) => (
                  <tr key={row.id} className={`group relative ${colors.hover}`}>
                    <td className="p-3 pl-6 font-mono opacity-50">{row.t}</td>
                    <td className="p-3 font-bold">{row.id}</td>
                    <td className="p-3 w-24 text-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold tracking-wider border border-transparent block w-full ${row.bg} ${row.color}`}
                      >
                        {row.act}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right pr-6 flex justify-end gap-1`}
                    >
                      <button
                        onClick={() => handleAuditAction(row.id, "allow")}
                        className={`p-1.5 hover:bg-green-500 hover:text-white transition-colors ${colors.textSecondary}`}
                        title="Approve"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        onClick={() => handleAuditAction(row.id, "block")}
                        className={`p-1.5 hover:bg-red-500 hover:text-white transition-colors ${colors.textSecondary}`}
                        title="Block"
                      >
                        <Ban size={14} />
                      </button>
                      <button
                        onClick={() => handleAuditAction(row.id, "monitor")}
                        className={`p-1.5 hover:bg-amber-500 hover:text-white transition-colors ${colors.textSecondary}`}
                        title="Monitor"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div
          className={`border ${colors.border} ${colors.card} flex flex-col h-full overflow-hidden`}
        >
          <div
            className={`px-6 py-4 border-b ${colors.border} flex justify-between items-center shrink-0`}
          >
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Shadow AI Scout
              </h3>
              <p className={`text-[10px] ${colors.textSecondary} mt-0.5`}>
                Unsanctioned model discovery
              </p>
            </div>
          </div>
          <div className={`flex-1 overflow-y-auto ${scrollbarClass} p-0`}>
            {[
              {
                ip: "172.16.0.44",
                name: "Ollama / Llama 3",
                status: "CRITICAL",
              },
              {
                ip: "172.16.0.89",
                name: "Unsecured vLLM",
                status: "HIGH RISK",
              },
              {
                ip: "10.0.1.55",
                name: "Python Script (LangChain)",
                status: "MEDIUM",
              },
            ].map((node, i) => (
              <div
                key={i}
                className={`p-5 flex items-center justify-between border-b ${colors.border} ${colors.hover}`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        node.status === "CRITICAL"
                          ? "bg-red-500"
                          : "bg-orange-500"
                      }`}
                    ></span>
                    <span className="text-xs font-bold font-mono">
                      {node.ip}
                    </span>
                  </div>
                  <div className="text-xs opacity-60 uppercase tracking-wider pl-4">
                    {node.name}
                  </div>
                </div>
                <button
                  onClick={() => setProvisionNode(node)}
                  className={`text-[10px] font-bold px-4 py-2 border ${colors.border} hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors uppercase tracking-wider`}
                >
                  Provision
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuntimePage;
