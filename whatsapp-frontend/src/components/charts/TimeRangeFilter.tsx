import { Calendar } from "lucide-react";
import FilterButton from "./filters/FilterButton";
import FilterSection from "./filters/FilterSection";

interface TimeRangeFilterProps {
  timeRange: "7d" | "30d" | "90d";
  setTimeRange: (value: "7d" | "30d" | "90d") => void;
}

export default function TimeRangeFilter({ timeRange, setTimeRange }: TimeRangeFilterProps) {
  const options = [
    { value: "7d" as const, label: "7 días" },
    { value: "30d" as const, label: "30 días" },
    { value: "90d" as const, label: "90 días" },
  ];

  return (
    <FilterSection
      icon={<Calendar className="w-5 h-5 text-gray-500" />}
      label="Período:"
    >
      {options.map((option) => (
        <FilterButton
          key={option.value}
          isActive={timeRange === option.value}
          onClick={() => setTimeRange(option.value)}
        >
          {option.label}
        </FilterButton>
      ))}
    </FilterSection>
  );
}
