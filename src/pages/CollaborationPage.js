import React, { useState } from "react";
import IncidentBoard from "../components/dashboard/IncidentBoard";
import { Plus } from "lucide-react";
import { getScrollbarClass } from "../components/shared/Theme";

const CollaborationPage = ({ isDark, colors, setSelectedTicket }) => {
  const scrollbarClass = getScrollbarClass(isDark);
  const [columns, setColumns] = useState({
    triage: {
      title: "Triage",
      color: "bg-red-500",
      items: [
        {
          id: "INC-3992",
          title: "Suspicious Egress to CN",
          assignee: "Faisal",
          time: "10m",
          tag: "Critical",
        },
      ],
    },
    investigation: {
      title: "Investigation",
      color: "bg-amber-500",
      items: [
        {
          id: "INC-3941",
          title: "API Key Leak in Logs",
          assignee: "Unassigned",
          time: "2h",
          tag: "High",
        },
      ],
    },
    remediation: {
      title: "In Remediation",
      color: "bg-blue-500",
      items: [
        {
          id: "INC-3882",
          title: "Shadow LLM Sprawl",
          assignee: "Sarah",
          time: "1d",
          tag: "Medium",
        },
      ],
    },
    closed: {
      title: "Closed",
      color: "bg-green-500",
      items: [
        {
          id: "INC-3771",
          title: "Rate Limit Spike",
          assignee: "System",
          time: "2d",
          tag: "Low",
        },
      ],
    },
  });

  const handleDropCard = (sourceCol, destCol, cardId) => {
    const card = columns[sourceCol].items.find((i) => i.id === cardId);
    if (!card) return;
    setColumns((prev) => ({
      ...prev,
      [sourceCol]: {
        ...prev[sourceCol],
        items: prev[sourceCol].items.filter((i) => i.id !== cardId),
      },
      [destCol]: { ...prev[destCol], items: [...prev[destCol].items, card] },
    }));
  };

  return (
    <div
      className={`flex-1 overflow-hidden bg-opacity-50 flex flex-col h-full`}
    >
      <div
        className={`px-8 py-6 border-b ${colors.border} flex justify-between items-center`}
      >
        <div>
          <h2 className="text-xl font-bold">Incident Response Board</h2>
          <p className={`text-xs ${colors.textSecondary} mt-1`}>
            Collaborate on active security alerts.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-2 shadow-lg">
            <Plus size={14} /> New Incident
          </button>
        </div>
      </div>
      <div className={`flex-1 overflow-x-auto ${scrollbarClass} ${colors.bg}`}>
        <IncidentBoard
          colors={colors}
          isDark={isDark}
          columns={columns}
          setColumns={setColumns}
          onDropCard={handleDropCard}
          onCardClick={setSelectedTicket}
          scrollbarClass={scrollbarClass}
        />
      </div>
    </div>
  );
};
export default CollaborationPage;
