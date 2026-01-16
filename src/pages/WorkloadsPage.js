import React, { useState } from "react";
import { Target } from "lucide-react";

const WorkloadsPage = ({ isDark, colors }) => {
  const [scopes, setScopes] = useState([
    {
      id: "scope_fin",
      name: "Finance Services",
      count: 12,
      definition: "k8s.ns:finance AND label:pci-dss",
    },
    {
      id: "scope_ext",
      name: "External Agents",
      count: 4,
      definition: "source:unknown OR label:vendor",
    },
    {
      id: "scope_llm",
      name: "AI Models",
      count: 8,
      definition: "label:type=llm",
    },
  ]);
  const [selectedScopeId, setSelectedScopeId] = useState("scope_fin");
  const selectedScope = scopes.find((s) => s.id === selectedScopeId);
  const agents = [
    {
      id: "spiffe://acme/finance/billing-01",
      ip: "10.0.1.45",
      status: "Healthy",
      last_seen: "2s ago",
    },
    {
      id: "spiffe://acme/finance/ledger-svc",
      ip: "10.0.1.48",
      status: "Healthy",
      last_seen: "5s ago",
    },
  ];
  return (
    <div className="flex h-full font-sans">
      <div
        className={`w-72 border-r ${colors.border} flex flex-col ${colors.sidebar}`}
      >
        <div
          className={`h-16 border-b ${colors.border} flex items-center justify-between px-6 shrink-0`}
        >
          <div
            className={`flex items-center gap-2 font-bold tracking-tight ${colors.textPrimary}`}
          >
            <Target size={18} />
            <span>Scopes</span>
          </div>
        </div>
        <div className={`flex-1 overflow-y-auto`}>
          {scopes.map((scope) => (
            <div
              key={scope.id}
              onClick={() => setSelectedScopeId(scope.id)}
              className={`p-4 border-b ${
                colors.border
              } cursor-pointer group hover:bg-opacity-50 ${
                selectedScopeId === scope.id
                  ? isDark
                    ? "bg-[#14161B] border-l-2 border-l-blue-500"
                    : "bg-white border-l-2 border-l-blue-500"
                  : `border-l-2 border-l-transparent ${colors.hover}`
              }`}
            >
              <h4 className="text-sm font-bold mb-1">{scope.name}</h4>
              <p className={`text-[10px] font-mono opacity-50`}>
                {scope.definition}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className={`flex-1 flex flex-col ${colors.bg}`}>
        <div
          className={`h-20 border-b ${colors.border} flex items-center justify-between px-8 ${colors.headerBg}`}
        >
          <h1
            className={`text-xl font-bold flex items-center gap-2 ${colors.textPrimary}`}
          >
            {selectedScope.name}
          </h1>
        </div>
        <div className="flex-1 p-8">
          <table className="w-full text-left text-xs">
            <tbody className={`divide-y ${colors.divider}`}>
              {agents.map((a) => (
                <tr key={a.id} className={colors.hover}>
                  <td className="p-4 font-mono">{a.id}</td>
                  <td className="p-4">{a.ip}</td>
                  <td className="p-4 text-green-500">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default WorkloadsPage;
