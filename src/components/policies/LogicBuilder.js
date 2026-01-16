import React, { useState, useEffect } from "react";
import {
  Ban,
  FileJson,
  Bell,
  Eye,
  CheckCircle,
  Code,
  Plus,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { getScrollbarClass } from "../shared/Theme";

// Helper to generate Rego code
const generateRegoCode = (trigger, conditions, selectedActions) => {
  const timestamp = new Date().toISOString();
  let code = `# Auto-generated Policy\n# Trigger: ${trigger}\n# Updated: ${timestamp}\n\npackage beacon.guardrails\n\n`;
  const ruleName = selectedActions.includes("block") ? "deny" : "warn";
  code += `${ruleName}[msg] {\n  # 1. Scope Definition\n  input.protocol == "http"\n\n  # 2. Conditions\n`;
  conditions.forEach((c) => {
    let line = `  `;
    const field = c.field;
    if (c.op === "EQUALS") line += `${field} == "${c.value}"`;
    else if (c.op === "NOT_EQUALS") line += `${field} != "${c.value}"`;
    else if (c.op === "CONTAINS") line += `contains(${field}, "${c.value}")`;
    else if (c.op === "STARTS_WITH")
      line += `startswith(${field}, "${c.value}")`;
    else if (c.op === "REGEX_MATCH")
      line += `regex.match("${c.value}", ${field})`;
    code += `${line}\n`;
  });
  code += `\n  # 3. Outcome Message\n  msg := "Policy Violation: Condition match detected on ${trigger}"\n}`;
  return code;
};

const LogicBuilder = ({ isDark, colors, editorMode, setEditorMode }) => {
  const [trigger, setTrigger] = useState("http_request");
  const [conditions, setConditions] = useState([
    { id: 1, gate: "IF", field: "input.method", op: "EQUALS", value: "POST" },
    {
      id: 2,
      gate: "AND",
      field: "body.payload",
      op: "REGEX_MATCH",
      value: "(?:4[0-9]{12}(?:[0-9]{3})?)",
    },
  ]);
  const [selectedActions, setSelectedActions] = useState(["block", "log"]);
  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    setGeneratedCode(generateRegoCode(trigger, conditions, selectedActions));
  }, [trigger, conditions, selectedActions]);

  const gates = ["IF", "AND", "OR", "AND NOT", "OR NOT"];
  const fields = [
    "input.method",
    "input.path",
    "input.source.id",
    "input.geo.country",
    "body.payload",
    "headers.user-agent",
  ];
  const operators = [
    "EQUALS",
    "NOT_EQUALS",
    "CONTAINS",
    "REGEX_MATCH",
    "STARTS_WITH",
    "ENDS_WITH",
  ];
  const actionsList = [
    { id: "block", label: "Block Request", icon: Ban, color: "red" },
    { id: "log", label: "Audit Log", icon: FileJson, color: "blue" },
    { id: "alert", label: "Send Alert", icon: Bell, color: "amber" },
    { id: "redact", label: "Redact PII", icon: Eye, color: "purple" },
  ];

  const updateCondition = (id, key, val) =>
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, [key]: val } : c))
    );

  const cardClass = `p-4 border flex flex-wrap items-center gap-4 transition-all ${colors.card} ${colors.border}`;
  const selectBase = `appearance-none outline-none font-mono text-xs font-medium cursor-pointer bg-transparent w-full ${
    isDark ? "text-gray-300" : "text-gray-700"
  }`;
  const inputContainer = `h-9 px-3 border ${colors.border} ${
    isDark ? "bg-[#0A0A0A]" : "bg-gray-50"
  } flex items-center relative transition-colors focus-within:border-blue-500`;
  const optionClass = isDark
    ? "bg-[#14161B] text-gray-300"
    : "bg-white text-gray-800";

  return (
    <div className="h-full flex flex-col">
      <div
        className={`px-8 py-3 border-b ${colors.border} flex justify-between items-center shrink-0`}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary}`}
        >
          Logic Definition
        </span>
        <div className="flex bg-black/10 dark:bg-white/5 p-1 border border-transparent dark:border-white/5">
          <button
            onClick={() => setEditorMode("visual")}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase transition-all ${
              editorMode === "visual"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Visual Builder
          </button>
          <button
            onClick={() => setEditorMode("code")}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${
              editorMode === "code"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Code size={12} /> Code Editor
          </button>
        </div>
      </div>
      {editorMode === "visual" ? (
        <div
          className={`p-8 space-y-6 flex-1 overflow-y-auto ${
            isDark ? "text-gray-300" : "text-gray-800"
          }`}
        >
          <div className={cardClass}>
            <div className="h-9 px-4 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider border shrink-0 bg-blue-600 text-white border-blue-700 shadow-sm cursor-default">
              WHEN
            </div>
            <div className={`${inputContainer} min-w-[240px]`}>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className={`${selectBase} relative z-10`}
              >
                <option className={optionClass} value="http_request">
                  HTTP Request Intercepted
                </option>
                <option className={optionClass} value="http_response">
                  HTTP Response Intercepted
                </option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-2.5 opacity-50 pointer-events-none z-0"
              />
            </div>
          </div>
          <div className="space-y-3 relative">
            <div
              className={`absolute left-[31px] top-[-24px] bottom-[-24px] w-0.5 -z-10 ${
                isDark ? "bg-gray-800" : "bg-gray-200"
              }`}
            ></div>
            {conditions.map((cond) => (
              <div key={cond.id} className={cardClass}>
                <div
                  className={`relative h-9 min-w-[80px] flex items-center border ${
                    cond.gate.includes("IF")
                      ? "bg-purple-500/10 text-purple-500 border-purple-500/30"
                      : "bg-gray-500/10 text-gray-500 border-gray-500/30"
                  }`}
                >
                  <select
                    value={cond.gate}
                    onChange={(e) =>
                      updateCondition(cond.id, "gate", e.target.value)
                    }
                    className="appearance-none bg-transparent outline-none w-full h-full pl-3 pr-7 text-[10px] font-bold uppercase tracking-wider cursor-pointer z-10"
                  >
                    {gates.map((g) => (
                      <option key={g} className={optionClass} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 opacity-70 pointer-events-none"
                  />
                </div>
                <div className={`${inputContainer} w-48`}>
                  <select
                    value={cond.field}
                    onChange={(e) =>
                      updateCondition(cond.id, "field", e.target.value)
                    }
                    className={selectBase}
                  >
                    {fields.map((f) => (
                      <option key={f} className={optionClass} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={`${inputContainer} w-40`}>
                  <select
                    value={cond.op}
                    onChange={(e) =>
                      updateCondition(cond.id, "op", e.target.value)
                    }
                    className={`${selectBase} opacity-80`}
                  >
                    {operators.map((op) => (
                      <option key={op} className={optionClass} value={op}>
                        {op.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={`${inputContainer} flex-1`}>
                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) =>
                      updateCondition(cond.id, "value", e.target.value)
                    }
                    className={`flex-1 bg-transparent outline-none text-xs font-mono placeholder-opacity-50 ${
                      isDark
                        ? "text-green-400 placeholder-gray-600"
                        : "text-green-700 placeholder-gray-400"
                    }`}
                    placeholder="Value..."
                  />
                </div>
                <button
                  onClick={() =>
                    setConditions(conditions.filter((c) => c.id !== cond.id))
                  }
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="pl-0 pt-2">
              <button
                onClick={() =>
                  setConditions([
                    ...conditions,
                    {
                      id: Date.now(),
                      gate: "AND",
                      field: "input.source.id",
                      op: "EQUALS",
                      value: "",
                    },
                  ])
                }
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed ${colors.border} ${colors.textSecondary} hover:${colors.textPrimary} hover:border-gray-500 transition-all text-xs font-bold uppercase tracking-wider`}
              >
                <Plus size={14} /> Add Condition Block
              </button>
            </div>
          </div>
          <div
            className={`p-4 border flex flex-col gap-4 transition-all ${colors.card} ${colors.border} mt-6`}
          >
            <div className="flex items-center gap-4">
              <div className="h-9 px-4 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider border shrink-0 bg-red-600 text-white border-red-700 shadow-sm cursor-default">
                THEN
              </div>
              <span className="text-xs opacity-50 uppercase tracking-wider">
                Execute Selected Actions
              </span>
              <div className="flex-1 flex flex-wrap gap-3">
                {actionsList.map((action) => {
                  const isSelected = selectedActions.includes(action.id);
                  return (
                    <div
                      key={action.id}
                      onClick={() =>
                        setSelectedActions(
                          isSelected
                            ? selectedActions.filter((a) => a !== action.id)
                            : [...selectedActions, action.id]
                        )
                      }
                      className={`cursor-pointer h-9 px-4 border flex items-center gap-2 transition-all ${
                        isSelected
                          ? isDark
                            ? `bg-${action.color}-500/10 border-${action.color}-500 text-${action.color}-500`
                            : `bg-${action.color}-50 border-${action.color}-500 text-${action.color}-700`
                          : `${colors.border} opacity-50 hover:opacity-100`
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle size={12} />
                      ) : (
                        <div
                          className={`w-3 h-3 border border-current opacity-50`}
                        />
                      )}
                      <span className="text-xs font-bold">{action.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`flex-grow h-[500px] flex flex-col ${
            isDark ? "bg-[#050505]" : "bg-gray-50"
          }`}
        >
          <textarea
            value={generatedCode}
            onChange={(e) => setGeneratedCode(e.target.value)}
            className={`flex-1 w-full h-full p-8 font-mono text-sm leading-relaxed resize-none outline-none bg-transparent ${
              isDark ? "text-gray-300" : "text-gray-800"
            } ${getScrollbarClass(isDark)}`}
            spellCheck="false"
          />
        </div>
      )}
    </div>
  );
};

export default LogicBuilder;
