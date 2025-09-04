// /components/card/StatCard.tsx
import React from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  className?: string;
};

export const StatCard = ({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
  className = "",
}: StatCardProps) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="text-blue-600">{icon}</div>
        </div>
        {change && (
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${
              changeType === "positive"
                ? "text-green-600 bg-green-50"
                : changeType === "negative"
                ? "text-red-600 bg-red-50"
                : "text-gray-600 bg-gray-50"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );
};
