import React from "react";
import { MoreHorizontal } from "lucide-react";

const IncidentBoard = ({
  colors,
  isDark,
  columns,
  setColumns,
  onDropCard,
  onCardClick,
  scrollbarClass,
}) => {
  const handleDragStart = (e, cardId, sourceCol) => {
    e.dataTransfer.setData("cardId", cardId);
    e.dataTransfer.setData("sourceCol", sourceCol);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e, destCol) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    const sourceCol = e.dataTransfer.getData("sourceCol");
    if (sourceCol !== destCol) {
      onDropCard(sourceCol, destCol, cardId);
    }
  };
  const getSeverityColor = (tag) => {
    if (tag === "Critical")
      return isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-700 border-red-200";
    if (tag === "High")
      return isDark
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-100 text-orange-700 border-orange-200";
    if (tag === "Medium")
      return isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-700 border-blue-200";
    return isDark
      ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
      : "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className={`flex h-full p-8 gap-6 overflow-x-auto ${scrollbarClass}`}>
      {Object.entries(columns).map(([colId, col]) => (
        <div
          key={colId}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, colId)}
          className={`flex-1 min-w-[300px] flex flex-col ${
            isDark ? "bg-[#0B0C10]" : "bg-gray-100/50"
          } border ${colors.border} transition-colors`}
        >
          <div className="p-4 flex justify-between items-center border-b border-inherit">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {col.title}
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 ${
                isDark ? "bg-white/5" : "bg-black/5"
              }`}
            >
              {col.items.length}
            </span>
          </div>
          <div
            className={`flex-1 p-3 space-y-3 overflow-y-auto ${scrollbarClass}`}
          >
            {col.items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id, colId)}
                onClick={() => onCardClick(item, colId)}
                className={`group relative p-4 border cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md ${
                  colors.card
                } ${colors.border} ${
                  isDark ? "hover:border-gray-600" : "hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 border ${getSeverityColor(
                      item.tag
                    )}`}
                  >
                    {item.tag}
                  </span>
                  <button className="text-gray-500 hover:text-white">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
                <h4
                  className={`text-sm font-bold mb-4 leading-snug ${colors.textPrimary}`}
                >
                  {item.title}
                </h4>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-700/30">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold text-white ${
                        item.assignee === "Unassigned"
                          ? "bg-gray-500"
                          : "bg-blue-600"
                      }`}
                    >
                      {item.assignee.charAt(0)}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${colors.textSecondary}`}
                    >
                      {item.assignee}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono ${colors.textSecondary}`}
                  >
                    {item.time} ago
                  </span>
                </div>
              </div>
            ))}
            <button
              className={`w-full py-3 border border-dashed text-[10px] font-bold uppercase ${colors.textSecondary} hover:text-blue-500 hover:border-blue-500 transition-all ${colors.border}`}
            >
              + New Incident
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
export default IncidentBoard;
