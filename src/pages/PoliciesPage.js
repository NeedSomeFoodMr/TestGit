import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Folder,
  FolderOpen,
  Save,
  PlayCircle,
  CheckCircle,
  X,
  Edit3,
  Trash2,
  GitFork,
  Shield,
  Zap,
  Database,
  Server,
  Globe,
  ArrowRight,
  Lock,
  AlertOctagon,
  Terminal,
  Code,
  LayoutTemplate,
  History,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  ChevronDown,
  Copy,
  Settings,
  CornerDownRight,
  Box,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { getScrollbarClass } from "../components/shared/Theme";

const PoliciesPage = ({ isDark, colors }) => {
  // --- CONFIGURATION ---
  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 90;

  // --- STATE ---
  const [policies, setPolicies] = useState([
    {
      id: "pol_1",
      name: "Block PII Egress",
      folder: "Finance Rules",
      status: "active",
      impact: "CRITICAL",
      updated: "2h ago",
      description:
        "Prevents any workload tagged with 'pci-dss' from communicating with public IPs.",
      scopes: ["Finance Group", "PCI-DSS"],
      code: `package beacon.finance\ndeny[msg] { ... }`,
      logic: [
        {
          id: "node_1",
          type: "Identity",
          label: "Billing Service",
          sub: "spiffe://acme/billing",
          icon: "Server",
          x: 100,
          y: 300,
          color: "blue",
        },
        {
          id: "node_2",
          type: "Action",
          label: "HTTP POST",
          sub: "input.method == 'POST'",
          icon: "Zap",
          x: 450,
          y: 300,
          color: "amber",
        },
        {
          id: "node_3",
          type: "Resource",
          label: "Public Internet",
          sub: "0.0.0.0/0",
          icon: "Globe",
          x: 800,
          y: 300,
          color: "purple",
        },
        {
          id: "node_4",
          type: "Decision",
          label: "DENY",
          sub: "Audit & Block",
          icon: "Shield",
          x: 1150,
          y: 300,
          color: "red",
          isEnd: true,
        },
      ],
      history: [
        {
          ver: "v2.1",
          user: "faisal.a",
          action: "Updated CIDR range",
          date: "2h ago",
        },
        {
          ver: "v2.0",
          user: "system",
          action: "Policy Activated",
          date: "1d ago",
        },
      ],
    },
  ]);

  const [selectedPolicyId, setSelectedPolicyId] = useState("pol_1");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [viewMode, setViewMode] = useState("visual");
  const [rightTab, setRightTab] = useState("overview");
  const [expandedFolders, setExpandedFolders] = useState({
    "Finance Rules": true,
    Uncategorized: true,
  });

  // Canvas State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  // Inspector State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [testInput, setTestInput] = useState(
    '{\n  "source": "billing-service",\n  "dest": "10.0.0.5"\n}'
  );
  const [testOutput, setTestOutput] = useState(null);

  const containerRef = useRef(null);
  const scrollbarClass = getScrollbarClass(isDark);

  const selectedPolicy =
    policies.find((p) => p.id === selectedPolicyId) || policies[0];
  const selectedNode = selectedPolicy.logic?.find(
    (n) => n.id === selectedNodeId
  );

  const uniqueFolders = Array.from(
    new Set(policies.map((p) => p.folder || "Uncategorized"))
  ).sort();

  // --- ACTIONS ---

  const createNewPolicy = () => {
    const newPol = {
      id: `pol_${Date.now()}`,
      name: "New Policy",
      folder: "Uncategorized",
      status: "draft",
      impact: "LOW",
      updated: "Just now",
      logic: [],
      scopes: [],
      history: [],
      code: "",
    };
    setPolicies([...policies, newPol]);
    setSelectedPolicyId(newPol.id);
    setSelectedNodeId(null);
    setExpandedFolders((p) => ({ ...p, Uncategorized: true }));
  };

  const addNodeAtIndex = (index) => {
    // Find position based on index or end
    const lastNode = selectedPolicy.logic[selectedPolicy.logic.length - 1];
    const startX = lastNode ? lastNode.x + 350 : 100;

    const newNode = {
      id: `node_${Date.now()}`,
      type: "Filter",
      label: "Logic Block",
      sub: "Configure...",
      icon: "Box",
      x: startX,
      y: 300,
      color: "gray",
    };

    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPolicyId) return p;
        const newLogic = [...p.logic];
        if (index === -1) {
          newLogic.push(newNode);
        } else {
          newLogic.splice(index + 1, 0, newNode);
        }
        // Sort immediately to keep order sane
        newLogic.sort((a, b) => a.x - b.x);
        return { ...p, logic: newLogic };
      })
    );
  };

  const deleteNode = () => {
    if (!selectedNodeId) return;
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPolicyId) return p;
        return { ...p, logic: p.logic.filter((n) => n.id !== selectedNodeId) };
      })
    );
    setSelectedNodeId(null);
  };

  // --- MOUSE HANDLERS ---

  const handleMouseDown = (e) => {
    if (viewMode === "code") return;
    // If hitting background
    if (e.target === containerRef.current || e.target.tagName === "svg") {
      setSelectedNodeId(null);
      setIsPanning(true);
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleGlobalMouseMove = (e) => {
    const dx = e.clientX - lastMousePosition.x;
    const dy = e.clientY - lastMousePosition.y;
    setLastMousePosition({ x: e.clientX, y: e.clientY });

    if (isPanning) {
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    } else if (draggingNodeId) {
      // LIVE UPDATE of coordinates
      setPolicies((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPolicyId) return p;
          return {
            ...p,
            logic: p.logic.map((n) =>
              n.id === draggingNodeId
                ? {
                    ...n,
                    x: n.x + dx / transform.scale,
                    y: n.y + dy / transform.scale,
                  }
                : n
            ),
          };
        })
      );
    }
  };

  const handleGlobalMouseUp = () => {
    // ON DROP: Sort the logic array based on X position to update "Sequence"
    if (draggingNodeId) {
      setPolicies((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPolicyId) return p;
          const sortedLogic = [...p.logic].sort((a, b) => a.x - b.x);
          return { ...p, logic: sortedLogic };
        })
      );
    }
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (viewMode === "code") return;
      e.preventDefault();
      setTransform((p) => ({
        ...p,
        scale: Math.min(Math.max(p.scale + e.deltaY * -0.001, 0.5), 3),
      }));
    };
    const c = containerRef.current;
    if (c) {
      c.addEventListener("wheel", handleWheel, { passive: false });
      return () => c.removeEventListener("wheel", handleWheel);
    }
  }, [viewMode]);

  const updatePolicyField = (field, value) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === selectedPolicyId ? { ...p, [field]: value } : p
      )
    );
  };

  const updateNodeField = (field, value) => {
    if (!selectedNodeId) return;
    let newColor = selectedNode.color;
    let newIcon = selectedNode.icon;

    if (field === "type") {
      if (value === "Identity") {
        newColor = "blue";
        newIcon = "Server";
      }
      if (value === "Action") {
        newColor = "amber";
        newIcon = "Zap";
      }
      if (value === "Resource") {
        newColor = "purple";
        newIcon = "Globe";
      }
      if (value === "Filter") {
        newColor = "gray";
        newIcon = "Box";
      }
      if (value === "Decision") {
        newColor = "red";
        newIcon = "Shield";
      }
    }
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPolicyId) return p;
        return {
          ...p,
          logic: p.logic.map((n) =>
            n.id === selectedNodeId
              ? { ...n, [field]: value, color: newColor, icon: newIcon }
              : n
          ),
        };
      })
    );
  };

  // --- RENDER HELPERS ---
  const suggestions = [
    "input.method",
    "input.path",
    "input.source.id",
    "input.geo.country",
    "body.payload",
    "headers.user-agent",
  ];

  const getIcon = (name) => {
    const map = { Server, Zap, Globe, Shield, Database, Lock, Box };
    const Icon = map[name] || Box;
    return <Icon size={16} />;
  };

  // BEZIER CURVE GENERATOR (Smooth S-Curve)
  const getBezierPath = (n1, n2) => {
    if (!n1 || !n2) return "";

    const startX = n1.x + NODE_WIDTH;
    const startY = n1.y + NODE_HEIGHT / 2;
    const endX = n2.x;
    const endY = n2.y + NODE_HEIGHT / 2;

    const dist = Math.abs(endX - startX);

    // Control points for S-Curve
    const cp1x = startX + dist * 0.5;
    const cp1y = startY;
    const cp2x = endX - dist * 0.5;
    const cp2y = endY;

    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  };

  // Calculate midpoints for + buttons
  const getMidPoint = (n1, n2) => {
    const startX = n1.x + NODE_WIDTH;
    const startY = n1.y + NODE_HEIGHT / 2;
    const endX = n2.x;
    const endY = n2.y + NODE_HEIGHT / 2;
    return { x: (startX + endX) / 2, y: (startY + endY) / 2 };
  };

  return (
    <div
      className={`w-full h-full flex overflow-hidden font-sans ${
        isDark ? "bg-[#050505] text-white" : "bg-gray-50 text-gray-900"
      }`}
      onMouseUp={handleGlobalMouseUp}
      onMouseLeave={handleGlobalMouseUp}
      onMouseMove={handleGlobalMouseMove}
    >
      {/* --- 1. LEFT SIDEBAR --- */}
      <div
        className={`w-80 flex flex-col border-r z-20 ${
          isDark ? "bg-[#14161B] border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`h-14 border-b flex items-center justify-between px-4 shrink-0 ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Policies
            </span>
          </div>
          <button
            onClick={createNewPolicy}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors shadow-lg"
          >
            <Plus size={12} /> New
          </button>
        </div>
        {/* Folder List */}
        <div className={`flex-1 overflow-y-auto ${scrollbarClass} p-2`}>
          {uniqueFolders.map((folder) => (
            <div key={folder} className="mb-2">
              <div
                onClick={() =>
                  setExpandedFolders((p) => ({ ...p, [folder]: !p[folder] }))
                }
                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer opacity-70 hover:opacity-100 group ${
                  expandedFolders[folder] ? "opacity-100" : ""
                }`}
              >
                {expandedFolders[folder] ? (
                  <FolderOpen size={12} />
                ) : (
                  <Folder size={12} />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {folder}
                </span>
              </div>

              {expandedFolders[folder] && (
                <div className="pl-2 space-y-1 mt-1 border-l border-dashed border-gray-500/30 ml-2 animate-in slide-in-from-left-2 duration-200">
                  {policies
                    .filter((p) => (p.folder || "Uncategorized") === folder)
                    .map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPolicyId(p.id);
                          setSelectedNodeId(null);
                        }}
                        className={`p-3 border cursor-pointer transition-all ${
                          selectedPolicyId === p.id
                            ? isDark
                              ? "bg-white/5 border-blue-500"
                              : "bg-blue-50 border-blue-500"
                            : "border-transparent hover:bg-black/5"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.status === "active"
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }`}
                            ></div>
                            <span
                              className={`text-[9px] font-bold ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 border ${
                              p.impact === "CRITICAL"
                                ? "text-red-500 border-red-500/30"
                                : "text-amber-500 border-amber-500/30"
                            }`}
                          >
                            {p.impact}
                          </span>
                        </div>
                        <div className="text-xs font-bold truncate mb-1">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] opacity-40">
                          <Clock size={10} /> {p.updated}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- 2. CENTER WORKSPACE --- */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Toolbar */}
        <div
          className={`h-14 border-b flex items-center justify-between px-6 shrink-0 z-30 ${
            isDark
              ? "bg-[#0B0C10] border-gray-800"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex bg-black/20 p-1 border border-gray-700/50 rounded-none">
              <button
                onClick={() => setViewMode("visual")}
                className={`flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  viewMode === "visual"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <LayoutTemplate size={12} /> Visual
              </button>
              <button
                onClick={() => setViewMode("code")}
                className={`flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  viewMode === "code"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <Code size={12} /> Code
              </button>
            </div>
            {viewMode === "visual" && (
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setTransform((p) => ({ ...p, scale: p.scale + 0.1 }))
                  }
                  className="p-1.5 hover:bg-white/10 rounded"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() =>
                    setTransform((p) => ({ ...p, scale: p.scale - 0.1 }))
                  }
                  className="p-1.5 hover:bg-white/10 rounded"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
                  className="p-1.5 hover:bg-white/10 rounded"
                >
                  <Move size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden bg-[#050505]">
          {viewMode === "visual" ? (
            <div
              ref={containerRef}
              className={`absolute inset-0 cursor-grab active:cursor-grabbing ${
                isDark ? "bg-[#050505]" : "bg-gray-100"
              }`}
              onMouseDown={(e) => {
                if (
                  e.target === containerRef.current ||
                  e.target.tagName === "svg"
                ) {
                  setSelectedNodeId(null);
                  setIsPanning(true);
                  setLastMousePosition({ x: e.clientX, y: e.clientY });
                }
              }}
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
                <g
                  transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
                >
                  {/* Connection Lines (BEZIER) */}
                  {selectedPolicy.logic?.map((node, i) => {
                    if (i === selectedPolicy.logic.length - 1) return null;
                    const nextNode = selectedPolicy.logic[i + 1];
                    const mid = getMidPoint(node, nextNode);

                    return (
                      <g key={`edge-${i}`}>
                        <path
                          d={getBezierPath(node, nextNode)}
                          fill="none"
                          stroke={isDark ? "#444" : "#ccc"}
                          strokeWidth="2"
                        />
                        {/* INSERT BUTTON (On Curve) */}
                        <foreignObject
                          x={mid.x - 12}
                          y={mid.y - 12}
                          width="24"
                          height="24"
                        >
                          <button
                            onClick={() => addNodeAtIndex(i)}
                            className="w-6 h-6 rounded-full flex items-center justify-center border bg-black border-gray-700 hover:border-blue-500 hover:text-blue-500 text-gray-500 transition-colors z-50 cursor-pointer shadow-lg"
                          >
                            <Plus size={12} />
                          </button>
                        </foreignObject>
                      </g>
                    );
                  })}

                  {/* LOGIC NODES */}
                  {selectedPolicy.logic?.map((node) => (
                    <foreignObject
                      key={node.id}
                      x={node.x}
                      y={node.y}
                      width={NODE_WIDTH}
                      height={NODE_HEIGHT + 20}
                      className="overflow-visible"
                      data-node-id={node.id}
                    >
                      <div
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        style={{ cursor: "grab" }}
                        className={`group relative w-full h-full border transition-shadow cursor-grab active:cursor-grabbing shadow-lg backdrop-blur-sm 
                                                ${
                                                  selectedNodeId === node.id
                                                    ? "border-blue-500 ring-2 ring-blue-500/20"
                                                    : isDark
                                                    ? "bg-[#14161B]/90 border-gray-700"
                                                    : "bg-white/90 border-gray-300"
                                                }
                                                ${
                                                  draggingNodeId === node.id
                                                    ? "z-50 shadow-2xl scale-105 border-dashed border-yellow-500"
                                                    : "z-10"
                                                }
                                            `}
                      >
                        <div
                          className={`h-1 w-full ${
                            node.isEnd
                              ? node.label === "ALLOW"
                                ? "bg-green-500"
                                : "bg-red-500"
                              : `bg-${node.color}-500`
                          }`}
                        ></div>
                        <div className="p-4 flex flex-col h-full justify-between">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider opacity-50 block mb-1">
                              {node.type}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-${node.color}-500`}>
                                {getIcon(node.icon)}
                              </span>
                              <span className="text-sm font-bold leading-tight">
                                {node.label}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`text-[10px] font-mono opacity-60 truncate bg-black/5 p-1 mt-2 border ${
                              isDark ? "border-white/5" : "border-black/5"
                            }`}
                          >
                            {node.sub}
                          </div>
                        </div>
                      </div>
                    </foreignObject>
                  ))}

                  {/* ADD BLOCK BUTTON (Empty Logic or End of Chain) */}
                  {!selectedPolicy.logic ||
                  selectedPolicy.logic.length === 0 ? (
                    // EMPTY STATE BUTTON
                    <foreignObject x={100} y={280} width="300" height="100">
                      <button
                        onClick={() => addNodeAtIndex(-1)}
                        className={`w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors ${
                          isDark
                            ? "border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-500"
                            : "border-gray-300 text-gray-500 hover:border-blue-500"
                        }`}
                      >
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                          <Plus size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Start Logic Chain
                        </span>
                      </button>
                    </foreignObject>
                  ) : (
                    // APPEND BUTTON
                    <foreignObject
                      x={
                        selectedPolicy.logic[selectedPolicy.logic.length - 1]
                          .x +
                        NODE_WIDTH +
                        60
                      }
                      y={
                        selectedPolicy.logic[selectedPolicy.logic.length - 1]
                          .y +
                        NODE_HEIGHT / 2 -
                        16
                      }
                      width="120"
                      height="32"
                    >
                      <button
                        onClick={() => addNodeAtIndex(-1)}
                        className={`w-full h-full border border-dashed rounded-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-transform ${
                          isDark
                            ? "border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-500"
                            : "border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500"
                        }`}
                      >
                        <Plus size={12} /> Add Block
                      </button>
                    </foreignObject>
                  )}
                </g>
              </svg>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col">
              <textarea
                className="flex-1 bg-[#0d0d0d] text-green-400 font-mono text-xs p-4 leading-6 resize-none outline-none border-none"
                value={selectedPolicy.code}
                onChange={(e) => updatePolicyField("code", e.target.value)}
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* --- 3. RIGHT PANEL (Inspector) --- */}
      <div
        className={`w-96 flex flex-col border-l z-20 ${
          isDark ? "bg-[#14161B] border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        {selectedNodeId ? (
          // --- A. NODE PROPERTIES ---
          <>
            <div
              className={`p-5 border-b flex justify-between items-center ${
                isDark
                  ? "border-gray-800 bg-blue-500/10"
                  : "border-gray-200 bg-blue-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="hover:text-blue-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                  Editing {selectedNode.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="hover:text-blue-500"
              >
                <X size={16} />
              </button>
            </div>
            <div
              className={`flex-1 p-5 space-y-6 overflow-y-auto ${scrollbarClass}`}
            >
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-2">
                  Block Label
                </label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(e) => updateNodeField("label", e.target.value)}
                  className={`w-full p-2 text-xs bg-transparent border outline-none ${
                    isDark
                      ? "border-gray-700 focus:border-blue-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
              </div>
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-2">
                  Selector / Value
                </label>
                <div
                  className={`flex items-center border ${
                    isDark ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <div className="p-2 bg-black/10 border-r border-gray-700/50">
                    <Code size={12} />
                  </div>
                  <input
                    type="text"
                    value={selectedNode.sub}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    onChange={(e) => updateNodeField("sub", e.target.value)}
                    className="flex-1 p-2 text-xs bg-transparent outline-none font-mono"
                  />
                </div>
                {showSuggestions && (
                  <div
                    className={`absolute left-0 right-0 top-full mt-1 border shadow-xl z-50 max-h-40 overflow-y-auto ${
                      isDark
                        ? "bg-[#14161B] border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {suggestions.map((s) => (
                      <div
                        key={s}
                        onClick={() => updateNodeField("sub", s)}
                        className={`px-3 py-2 text-xs font-mono cursor-pointer hover:bg-blue-500 hover:text-white ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-2">
                  Change Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Identity", "Action", "Resource", "Decision"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => updateNodeField("type", type)}
                        className={`p-2 text-[9px] font-bold uppercase border transition-colors ${
                          selectedNode.type === type
                            ? "border-blue-500 text-blue-500 bg-blue-500/10"
                            : "border-transparent bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
              </div>
              <button
                onClick={deleteNode}
                className="w-full py-3 mt-4 text-red-500 border border-red-500/20 hover:bg-red-500/10 text-[10px] font-bold uppercase flex items-center justify-center gap-2"
              >
                <Trash2 size={12} /> Remove Block
              </button>
            </div>
          </>
        ) : (
          // --- B. POLICY SETTINGS ---
          <>
            <div
              className={`p-5 border-b ${
                isDark
                  ? "border-gray-800 bg-[#0B0C10]"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-mono opacity-50">
                  {selectedPolicy.id}
                </span>

                <div className="relative group">
                  <select
                    value={selectedPolicy.status}
                    onChange={(e) =>
                      updatePolicyField("status", e.target.value)
                    }
                    className={`appearance-none pl-3 pr-8 py-1.5 text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer border hover:border-opacity-100 transition-all rounded ${
                      selectedPolicy.status === "active"
                        ? "border-green-500/30 bg-green-500/10 text-green-500"
                        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    <option
                      value="active"
                      className={
                        isDark
                          ? "bg-[#14161B] text-green-500"
                          : "bg-white text-green-600"
                      }
                    >
                      Active
                    </option>
                    <option
                      value="draft"
                      className={
                        isDark
                          ? "bg-[#14161B] text-yellow-500"
                          : "bg-white text-yellow-600"
                      }
                    >
                      Draft
                    </option>
                  </select>
                  <ChevronDown
                    size={12}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                      selectedPolicy.status === "active"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  />
                </div>
              </div>

              <div className="relative group mb-2">
                <input
                  type="text"
                  value={selectedPolicy.name}
                  onChange={(e) => updatePolicyField("name", e.target.value)}
                  className={`w-full bg-transparent text-lg font-bold leading-tight outline-none border-b border-transparent hover:border-gray-600 focus:border-blue-500 transition-colors pr-6 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                />
                <Edit3
                  size={12}
                  className="absolute right-0 top-1.5 text-gray-500 pointer-events-none"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <label className="text-[9px] font-bold uppercase tracking-wider opacity-50">
                  Impact:
                </label>
                <select
                  value={selectedPolicy.impact}
                  onChange={(e) => updatePolicyField("impact", e.target.value)}
                  className={`text-[10px] font-bold bg-transparent border-b outline-none cursor-pointer ${
                    selectedPolicy.impact === "CRITICAL"
                      ? "text-red-500 border-red-500"
                      : "text-amber-500 border-amber-500"
                  }`}
                >
                  <option
                    value="CRITICAL"
                    className={
                      isDark
                        ? "bg-[#14161B] text-red-500"
                        : "bg-white text-red-600"
                    }
                  >
                    CRITICAL
                  </option>
                  <option
                    value="HIGH"
                    className={
                      isDark
                        ? "bg-[#14161B] text-orange-500"
                        : "bg-white text-orange-600"
                    }
                  >
                    HIGH
                  </option>
                  <option
                    value="MEDIUM"
                    className={
                      isDark
                        ? "bg-[#14161B] text-blue-500"
                        : "bg-white text-blue-600"
                    }
                  >
                    MEDIUM
                  </option>
                </select>
              </div>
            </div>

            <div
              className={`flex border-b ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              {["Overview", "History", "Test"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab.toLowerCase())}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    rightTab === tab.toLowerCase()
                      ? "border-blue-500 text-blue-500"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className={`flex-1 overflow-y-auto ${scrollbarClass} p-5`}>
              {rightTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-2">
                      Group / Folder
                    </label>
                    <div
                      className={`flex items-center border ${
                        isDark
                          ? "border-gray-700 bg-white/5"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <div className="p-2 opacity-50">
                        <Folder size={14} />
                      </div>
                      <input
                        list="folders"
                        type="text"
                        value={selectedPolicy.folder}
                        onChange={(e) => {
                          const val = e.target.value;
                          updatePolicyField("folder", val);
                          // Expand new folder if not active
                          if (val && !expandedFolders[val]) {
                            setExpandedFolders((prev) => ({
                              ...prev,
                              [val]: true,
                            }));
                          }
                        }}
                        className="flex-1 p-2 text-xs bg-transparent outline-none font-bold"
                      />
                      <datalist id="folders">
                        {uniqueFolders.map((f) => (
                          <option key={f} value={f} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-2">
                      Description
                    </span>
                    <textarea
                      className={`w-full h-24 p-3 text-xs bg-transparent border outline-none resize-none ${
                        isDark
                          ? "border-gray-700 focus:border-blue-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      value={selectedPolicy.description}
                      onChange={(e) =>
                        updatePolicyField("description", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
              {rightTab === "history" && (
                <div className="space-y-4">
                  <div
                    className={`border ${
                      isDark ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    {selectedPolicy.history?.map((h, i) => (
                      <div
                        key={i}
                        className={`p-3 border-b last:border-0 flex justify-between items-center group ${
                          isDark
                            ? "border-gray-800 hover:bg-white/5"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-500 font-mono">
                              {h.ver}
                            </span>
                            <span className="text-[10px] opacity-50">
                              {h.date}
                            </span>
                          </div>
                          <div className="text-[10px] opacity-80">
                            {h.action}{" "}
                            <span className="opacity-50">by {h.user}</span>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-500 hover:text-white border border-gray-600 rounded transition-all">
                          <RotateCcw size={12} />
                        </button>
                      </div>
                    ))}
                    {(!selectedPolicy.history ||
                      selectedPolicy.history.length === 0) && (
                      <div className="p-4 text-[10px] opacity-50 text-center">
                        No history available
                      </div>
                    )}
                  </div>
                </div>
              )}
              {rightTab === "test" && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 flex flex-col mb-4">
                    <textarea
                      className={`flex-1 w-full p-3 font-mono text-xs bg-transparent border outline-none resize-none ${
                        isDark
                          ? "border-gray-700 bg-[#0d0d0d] text-blue-400"
                          : "border-gray-300 bg-gray-50 text-blue-700"
                      }`}
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() =>
                      setTestOutput({
                        decision: "DENY",
                        reason: "PII Egress Violation",
                        latency: "0.4ms",
                      })
                    }
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider mb-4 flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={14} /> Run Simulation
                  </button>
                  {testOutput && (
                    <div
                      className={`p-4 border-l-2 ${
                        testOutput.decision === "ALLOW"
                          ? "border-green-500 bg-green-500/10"
                          : "border-red-500 bg-red-500/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`text-xs font-bold ${
                            testOutput.decision === "ALLOW"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {testOutput.decision}
                        </span>
                        <span className="text-[9px] opacity-60 font-mono">
                          {testOutput.latency}
                        </span>
                      </div>
                      <p className="text-[10px] opacity-80">
                        {testOutput.reason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PoliciesPage;
