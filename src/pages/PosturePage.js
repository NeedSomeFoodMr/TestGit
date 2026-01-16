import React, { useState, useRef, useEffect } from "react";
import {
  Shield,
  Database,
  Lock,
  FileText,
  Server,
  AlertOctagon,
  Globe,
  X,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Move,
  LayoutList,
  Eye,
  Search,
  Ticket,
  Activity,
  Zap,
  SquareKanban,
  Copy,
  Terminal,
  ChevronRight,
  Siren,
} from "lucide-react";
import { getScrollbarClass } from "../components/shared/Theme";

const PosturePage = ({ isDark, colors }) => {
  // --- STATE ---
  const [selectedScenarioId, setSelectedScenarioId] = useState("path_1");
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const scrollbarClass = getScrollbarClass(isDark);

  // --- CONFIGURATION ---
  const NODE_SIZE = 56;
  const NODE_RADIUS = NODE_SIZE / 2;

  // --- MOCK DATA ---
  const scenarios = [
    {
      id: "path_1",
      title: "Public S3 Write Access",
      severity: "CRITICAL",
      nodes: 4,
      desc: "Billing Bot has wildcard write to public bucket.",
    },
    {
      id: "path_2",
      title: "Shadow Admin (Dev)",
      severity: "HIGH",
      nodes: 3,
      desc: "Dev workload has effective Admin on Prod DB.",
    },
    {
      id: "path_3",
      title: "Unencrypted PII Egress",
      severity: "HIGH",
      nodes: 5,
      desc: "Cleartext flow detected to external API.",
    },
    {
      id: "path_4",
      title: "Legacy TLS Usage",
      severity: "MEDIUM",
      nodes: 2,
      desc: "Service utilizing TLS 1.0.",
    },
    {
      id: "path_5",
      title: "Ghost Identity",
      severity: "LOW",
      nodes: 1,
      desc: "Inactive identity with active keys.",
    },
    {
      id: "path_6",
      title: "Hardcoded Secrets",
      severity: "CRITICAL",
      nodes: 2,
      desc: "API Keys found in env vars.",
    },
  ];

  const graphData = {
    path_1: {
      nodes: [
        {
          id: "agent-1",
          type: "AI Agent",
          name: "Billing Bot",
          status: "critical",
          x: 200,
          y: 300,
          icon: Server,
          details: {
            risk: "High",
            findings: 12,
            spiffe: "spiffe://acme/ns/fin/sa/billing",
            image: "sha256:8ca...2f1",
            uptime: "14d 2h",
          },
        },
        {
          id: "db-1",
          type: "Database",
          name: "Customer SQL",
          status: "secure",
          x: 700,
          y: 150,
          icon: Database,
          details: {
            risk: "None",
            findings: 0,
            spiffe: "spiffe://acme/ns/data/sa/sql",
            image: "postgres:15-alpine",
            uptime: "45d 12h",
          },
        },
        {
          id: "bucket-1",
          type: "Storage",
          name: "Invoice S3",
          status: "warning",
          x: 700,
          y: 450,
          icon: FileText,
          details: {
            risk: "Medium",
            findings: 3,
            spiffe: "N/A (AWS Resource)",
            image: "N/A",
            uptime: "99.99%",
          },
        },
        {
          id: "internet",
          type: "Network",
          name: "Public Internet",
          status: "neutral",
          x: 1000,
          y: 300,
          icon: Globe,
          details: {
            risk: "N/A",
            findings: 0,
            spiffe: "External",
            image: "N/A",
            uptime: "N/A",
          },
        },
      ],
      edges: [
        { from: "agent-1", to: "db-1", type: "Read / Write", danger: false },
        { from: "agent-1", to: "bucket-1", type: "Read Only", danger: false },
        {
          from: "bucket-1",
          to: "internet",
          type: "Public Exposure",
          danger: true,
        },
      ],
    },
    path_2: {
      nodes: [
        {
          id: "dev-pod",
          type: "Workload",
          name: "Dev Debugger",
          status: "warning",
          x: 200,
          y: 300,
          icon: Server,
          details: {
            risk: "High",
            findings: 5,
            spiffe: "spiffe://acme/ns/dev/sa/debug",
            image: "debug-tool:latest",
            uptime: "2h 15m",
          },
        },
        {
          id: "prod-db",
          type: "Database",
          name: "Prod Users",
          status: "critical",
          x: 700,
          y: 300,
          icon: Database,
          details: {
            risk: "Critical",
            findings: 8,
            spiffe: "spiffe://acme/ns/prod/sa/db",
            image: "postgres:14",
            uptime: "120d",
          },
        },
      ],
      edges: [
        { from: "dev-pod", to: "prod-db", type: "Admin Access", danger: true },
      ],
    },
  };

  const mockPermissions = [
    {
      resource: "s3://invoice-bucket/*",
      action: "s3:PutObject",
      effect: "ALLOW",
      source: "Policy-A",
    },
    {
      resource: "rds:db-prod",
      action: "rds:Connect",
      effect: "ALLOW",
      source: "Role-Billing",
    },
    { resource: "*", action: "*", effect: "DENY", source: "Guardrail-Base" },
  ];

  const mockIssues = [
    {
      id: "CVE-2024-1102",
      title: "Prompt Injection RCE",
      severity: "CRITICAL",
    },
    { id: "MISCONFIG-01", title: "Excessive Write Perms", severity: "HIGH" },
    { id: "COMPLIANCE-02", title: "Unencrypted Logs", severity: "MEDIUM" },
  ];

  const currentGraph = graphData[selectedScenarioId] || graphData["path_1"];

  // --- HELPERS ---
  const getStatusColor = (status) => {
    if (status === "critical") return "#EF4444";
    if (status === "warning") return "#F59E0B";
    if (status === "secure") return "#10B981";
    return "#6B7280";
  };

  // --- MATH: CENTER-TO-CENTER (GAPLESS) ---
  const getBezierPath = (n1, n2) => {
    if (!n1 || !n2) return { path: "", midX: 0, midY: 0 };

    const startX = n1.x + NODE_RADIUS;
    const startY = n1.y + NODE_RADIUS;
    const endX = n2.x + NODE_RADIUS;
    const endY = n2.y + NODE_RADIUS;

    const midX = (startX + endX) / 2;
    const dist = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );

    const cp1X = (startX + midX) / 2 + dist * 0.1;
    const cp1Y = startY;
    const cp2X = (midX + endX) / 2 - dist * 0.1;
    const cp2Y = endY;

    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

    return { path: path, midX: midX, midY: (startY + endY) / 2 - 14 };
  };

  // --- ZOOM HANDLERS ---
  const handleWheel = (e) => {
    e.preventDefault();
    setTransform((p) => ({
      ...p,
      scale: Math.min(Math.max(p.scale + e.deltaY * -0.001, 0.5), 3),
    }));
  };
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform((p) => ({
      ...p,
      x: p.x + (e.clientX - lastMousePosition.x),
      y: p.y + (e.clientY - lastMousePosition.y),
    }));
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };
  useEffect(() => {
    const c = containerRef.current;
    if (c) {
      c.addEventListener("wheel", handleWheel, { passive: false });
      return () => c.removeEventListener("wheel", handleWheel);
    }
  }, [transform.scale]);

  return (
    <div
      className={`w-full h-full relative overflow-hidden font-sans ${
        isDark ? "bg-[#050505] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* --- 1. FULL SCREEN CANVAS --- */}
      <div
        ref={containerRef}
        className={`absolute inset-0 z-0 cursor-grab active:cursor-grabbing ${
          isDark ? "bg-[#050505]" : "bg-gray-100"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(${
              isDark ? "#444" : "#bbb"
            } 1px, transparent 1px)`,
            backgroundSize: `${24 * transform.scale}px ${
              24 * transform.scale
            }px`,
            backgroundPosition: `${transform.x}px ${transform.y}px`,
          }}
        ></div>

        <svg className="w-full h-full overflow-visible">
          <defs>
            {currentGraph.edges.map((edge, i) => {
              const fromNode = currentGraph.nodes.find(
                (n) => n.id === edge.from
              );
              const toNode = currentGraph.nodes.find((n) => n.id === edge.to);
              return (
                <linearGradient
                  key={`grad-${i}`}
                  id={`grad-${i}`}
                  gradientUnits="userSpaceOnUse"
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                >
                  <stop
                    offset="0%"
                    stopColor={getStatusColor(fromNode.status)}
                  />
                  <stop
                    offset="100%"
                    stopColor={getStatusColor(toNode.status)}
                  />
                </linearGradient>
              );
            })}
          </defs>
          <g
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
          >
            {currentGraph.edges.map((edge, i) => {
              const fromNode = currentGraph.nodes.find(
                (n) => n.id === edge.from
              );
              const toNode = currentGraph.nodes.find((n) => n.id === edge.to);
              const { path, midX, midY } = getBezierPath(fromNode, toNode);
              return (
                <g key={i}>
                  <path
                    d={path}
                    fill="none"
                    stroke={`url(#grad-${i})`}
                    strokeWidth="3"
                    opacity="0.8"
                    strokeLinecap="round"
                  />
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    fill={isDark ? "#ccc" : "#555"}
                    fontSize="10"
                    fontWeight="bold"
                    className="uppercase tracking-wider"
                    style={{
                      textShadow: `3px 0px 0px ${
                        isDark ? "#050505" : "#FFF"
                      }, -3px 0px 0px ${
                        isDark ? "#050505" : "#FFF"
                      }, 0px 3px 0px ${
                        isDark ? "#050505" : "#FFF"
                      }, 0px -3px 0px ${isDark ? "#050505" : "#FFF"}`,
                    }}
                  >
                    {edge.type}
                  </text>
                </g>
              );
            })}
            {currentGraph.nodes.map((node) => (
              <foreignObject
                key={node.id}
                x={node.x}
                y={node.y}
                width={NODE_SIZE}
                height={NODE_SIZE + 40}
                className="overflow-visible"
              >
                <div
                  className="relative flex flex-col items-center group cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                    setActiveTab("overview");
                  }}
                >
                  <div className="relative w-[56px] h-[56px] flex items-center justify-center">
                    {node.status === "critical" && (
                      <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-50 pointer-events-none"></div>
                    )}
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center transition-transform shadow-xl z-20 hover:scale-110 border-2 ${
                        isDark ? "border-gray-900" : "border-white"
                      } ${
                        selectedNode?.id === node.id
                          ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-black"
                          : ""
                      }`}
                      style={{ backgroundColor: getStatusColor(node.status) }}
                    >
                      <node.icon size={26} color="white" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="mt-3 text-center w-40 pointer-events-none">
                    <span
                      className={`text-[12px] font-bold ${
                        node.status === "critical"
                          ? "text-red-500"
                          : isDark
                          ? "text-white"
                          : "text-black"
                      }`}
                      style={{
                        textShadow: `0px 2px 4px ${
                          isDark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)"
                        }`,
                      }}
                    >
                      {node.name}
                    </span>
                  </div>
                </div>
              </foreignObject>
            ))}
          </g>
        </svg>
      </div>

      {/* --- 2. LEFT STACK (Unified Console) --- */}
      <div
        className={`absolute top-4 left-4 bottom-24 w-[450px] z-20 flex flex-col gap-4 pointer-events-none`}
      >
        {/* Top Search Bar */}
        <div
          className={`h-12 border flex items-center px-4 backdrop-blur-md shadow-2xl ${
            isDark
              ? "bg-[#14161B]/95 border-gray-700 text-white"
              : "bg-white/95 border-gray-200 text-black"
          } rounded-none pointer-events-auto shrink-0 mb-2`}
        >
          <Search size={16} className="opacity-50 mr-3" />
          <input
            type="text"
            placeholder="Search infrastructure..."
            className="bg-transparent border-none outline-none text-xs font-bold w-full h-full placeholder-opacity-50"
          />
        </div>

        {/* THE STACK: Fixed Split Layout */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* A. ATTACK PATHS LIST (Top Half - 45%) */}
          <div
            className={`flex flex-col border backdrop-blur-md shadow-2xl ${
              isDark
                ? "bg-[#14161B]/95 border-gray-700"
                : "bg-white/95 border-gray-200"
            } rounded-none h-[45%] pointer-events-auto`}
          >
            <div className="px-4 py-3 border-b border-gray-700/50 flex justify-between items-center shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <LayoutList size={14} /> Attack Paths
              </span>
              <span className="text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5">
                5
              </span>
            </div>
            <div className={`flex-1 overflow-y-auto ${scrollbarClass}`}>
              {scenarios.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedScenarioId(s.id);
                    setSelectedNode(null);
                    setTransform({ x: 0, y: 0, scale: 1 });
                  }}
                  className={`p-4 border-b border-gray-700/20 cursor-pointer hover:bg-blue-500/10 transition-colors group relative ${
                    selectedScenarioId === s.id ? "bg-blue-500/5" : ""
                  }`}
                >
                  {selectedScenarioId === s.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  )}
                  <div className="flex justify-between mb-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                        s.severity === "CRITICAL"
                          ? "text-red-500 border-red-500/30"
                          : s.severity === "HIGH"
                          ? "text-orange-500 border-orange-500/30"
                          : "text-blue-500 border-blue-500/30"
                      }`}
                    >
                      {s.severity}
                    </span>
                  </div>
                  <h4
                    className={`text-sm font-bold mb-1 ${
                      selectedScenarioId === s.id ? "text-blue-400" : ""
                    }`}
                  >
                    {s.title}
                  </h4>
                  <p className="text-[10px] opacity-60 leading-tight">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* B. INSPECTOR ZONE (Bottom Half - 45% - Fills when active) */}
          <div className="h-[45%] relative">
            {selectedNode ? (
              <div
                className={`absolute inset-0 flex flex-col border backdrop-blur-md shadow-2xl ${
                  isDark
                    ? "bg-[#14161B]/95 border-gray-700"
                    : "bg-white/95 border-gray-200"
                } rounded-none animate-in slide-in-from-left-4 fade-in duration-300 pointer-events-auto`}
              >
                {/* Header */}
                <div
                  className={`px-4 py-3 border-b flex justify-between items-center shrink-0 ${
                    isDark
                      ? "border-gray-700 bg-blue-500/10"
                      : "border-gray-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Server size={14} className="text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Node Inspector
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="hover:text-blue-500"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Node Identity Card */}
                <div
                  className={`px-5 py-4 border-b flex items-start gap-4 ${
                    isDark
                      ? "border-gray-700/50 bg-black/10"
                      : "border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg border border-gray-700"
                    style={{
                      backgroundColor: getStatusColor(selectedNode.status),
                    }}
                  >
                    <selectedNode.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold truncate">
                        {selectedNode.name}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                          selectedNode.status === "critical"
                            ? "text-red-500 border-red-500/30"
                            : "text-green-500 border-green-500/30"
                        }`}
                      >
                        {selectedNode.details.risk}
                      </span>
                    </div>
                    <p className="text-[10px] opacity-50 font-mono truncate mt-0.5">
                      {selectedNode.id}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div
                  className={`flex border-b ${
                    isDark ? "border-gray-700/50" : "border-gray-200"
                  }`}
                >
                  {["Overview", "Permissions", "Issues"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-black/5 transition-colors border-b-2 ${
                        activeTab === tab.toLowerCase()
                          ? "border-blue-500 text-blue-500"
                          : "border-transparent opacity-60"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className={`flex-1 overflow-y-auto ${scrollbarClass} p-4`}>
                  {activeTab === "overview" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          className={`p-2 border ${
                            isDark
                              ? "border-gray-700/50 bg-black/20"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold opacity-50 block">
                            Uptime
                          </span>
                          <span className="text-xs font-mono">
                            {selectedNode.details.uptime}
                          </span>
                        </div>
                        <div
                          className={`p-2 border ${
                            isDark
                              ? "border-gray-700/50 bg-black/20"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold opacity-50 block">
                            Total Issues
                          </span>
                          <span className="text-xs font-mono">
                            {selectedNode.details.findings}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`p-2 border ${
                          isDark
                            ? "border-gray-700/50 bg-black/20"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] uppercase font-bold opacity-50">
                            SPIFFE ID
                          </span>
                          <Copy
                            size={10}
                            className="opacity-50 cursor-pointer hover:text-blue-500"
                          />
                        </div>
                        <div className="text-[10px] font-mono break-all opacity-80">
                          {selectedNode.details.spiffe}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "permissions" && (
                    <div className="space-y-2">
                      {mockPermissions.map((perm, i) => (
                        <div
                          key={i}
                          className={`p-2 border flex justify-between items-center ${
                            isDark
                              ? "border-gray-700/50 bg-black/20"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div>
                            <div
                              className={`text-[10px] font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {perm.action}
                            </div>
                            <div className="text-[9px] font-mono opacity-50">
                              {perm.resource}
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 ${
                              perm.effect === "ALLOW"
                                ? "text-green-500 bg-green-500/10"
                                : "text-red-500 bg-red-500/10"
                            }`}
                          >
                            {perm.effect}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "issues" && (
                    <div className="space-y-2">
                      {mockIssues.map((issue, i) => (
                        <div
                          key={i}
                          className={`p-2 border group hover:border-red-500/30 transition-colors ${
                            isDark
                              ? "border-gray-700/50 bg-black/20"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className={`text-[9px] font-bold ${
                                issue.severity === "CRITICAL"
                                  ? "text-red-500"
                                  : "text-orange-500"
                              }`}
                            >
                              {issue.severity}
                            </span>
                            <span className="text-[9px] font-mono opacity-40">
                              {issue.id}
                            </span>
                          </div>
                          <div
                            className={`text-[10px] font-bold leading-tight ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {issue.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div
                  className={`p-3 border-t shrink-0 flex gap-2 ${
                    isDark
                      ? "border-gray-700/50 bg-black/20"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-lg rounded-none flex items-center justify-center gap-2">
                    <Eye size={12} /> Deep Scan
                  </button>
                  <button
                    className={`flex-1 py-2 border text-[10px] font-bold uppercase tracking-wider transition-colors rounded-none flex items-center justify-center gap-2 ${
                      isDark
                        ? "border-gray-600 hover:bg-white/10"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Siren size={12} /> Escalate Incident
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center border border-dashed opacity-50 ${
                  isDark ? "border-gray-700" : "border-gray-300"
                } rounded-none`}
              >
                <Shield size={24} className="opacity-20 mb-2" />
                <p className="text-[10px] uppercase font-bold opacity-40">
                  Select a node to inspect
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- 3. THE "BOSS BAR" (Bottom Stats - Tech Style) --- */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[800px] z-20 flex flex-col pointer-events-auto`}
      >
        {/* Labels Row */}
        <div className="flex justify-between px-1 mb-2 font-mono">
          <div className="flex items-center gap-2">
            <AlertOctagon size={14} className="text-red-500" />
            <span className="text-xs text-red-400 uppercase tracking-tight">
              Critical{" "}
              <span
                className={`font-bold ml-1 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                4
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-amber-500" />
            <span className="text-xs text-amber-400 uppercase tracking-tight">
              Over-Priv{" "}
              <span
                className={`font-bold ml-1 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                12
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-blue-500" />
            <span className="text-xs text-blue-400 uppercase tracking-tight">
              Exposure{" "}
              <span
                className={`font-bold ml-1 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                7
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-gray-500" />
            <span className="text-xs text-gray-400 uppercase tracking-tight">
              Passing{" "}
              <span
                className={`font-bold ml-1 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                156
              </span>
            </span>
          </div>
        </div>

        {/* The Bar Itself - Flat Style (No Shadow) */}
        <div
          className={`h-3 w-full flex backdrop-blur-md rounded-none overflow-hidden border ${
            isDark
              ? "bg-gray-900/90 border-gray-700"
              : "bg-white/90 border-gray-300"
          }`}
        >
          <div className="h-full bg-red-500 relative" style={{ width: "10%" }}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30"></div>
          </div>
          <div
            className="h-full bg-amber-500 relative"
            style={{ width: "25%" }}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30"></div>
          </div>
          <div className="h-full bg-blue-500 relative" style={{ width: "15%" }}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30"></div>
          </div>
          <div
            className={`h-full ${isDark ? "bg-gray-700/30" : "bg-gray-200"}`}
            style={{ width: "50%" }}
          ></div>
        </div>
      </div>

      {/* --- 4. MAP CONTROLS (Top Right) --- */}
      <div
        className={`absolute top-4 right-4 z-20 flex flex-col gap-1 pointer-events-auto`}
      >
        <div
          className={`p-1 border backdrop-blur-md shadow-lg flex flex-col gap-1 ${
            isDark
              ? "bg-[#14161B]/90 border-gray-700"
              : "bg-white/90 border-gray-200"
          } rounded-none`}
        >
          <button
            onClick={() =>
              setTransform((p) => ({ ...p, scale: p.scale + 0.1 }))
            }
            className="p-2 hover:bg-blue-500 hover:text-white transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() =>
              setTransform((p) => ({ ...p, scale: p.scale - 0.1 }))
            }
            className="p-2 hover:bg-blue-500 hover:text-white transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
            className="p-2 hover:bg-blue-500 hover:text-white transition-colors"
          >
            <Move size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosturePage;
