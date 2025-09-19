// /components/charts/GroupNameFilter.tsx
import { useState } from "react";
import { Filter } from "lucide-react";

interface GroupNameFilterProps {
  groups: string[];
  selectedGroup: string;
  setSelectedGroup: (value: string) => void;
}

export function GroupNameFilter({
  groups,
  selectedGroup,
  setSelectedGroup,
}: GroupNameFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-gray-700">
        <Filter className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-sm">Grupo:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGroup("all")}
          className={`
            px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border
            ${
              selectedGroup === "all"
                ? "bg-gray-100 text-gray-700 border-gray-300 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }
          `}
        >
          Todas
          {selectedGroup === "all" && <span className="ml-1">✓</span>}
        </button>

        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={`
              px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border
              ${
                selectedGroup === group
                  ? "bg-blue-100 text-blue-700 border-blue-200 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }
            `}
          >
            {group}
            {selectedGroup === group && <span className="ml-1">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}