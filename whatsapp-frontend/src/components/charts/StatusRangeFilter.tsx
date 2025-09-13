import { CheckCircle } from "lucide-react";
import FilterButton from "./filters/FilterButton";
import FilterSection from "./filters/FilterSection";


interface StatusOption {
  value: string;
  label: string;
  variant: 'default' | 'success' | 'error';
}

interface StatusFilterProps {
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

export default function StatusFilter({
  selectedStatus,
  setSelectedStatus,
}: StatusFilterProps) {
  const statusOptions: StatusOption[] = [
    { value: "all", label: "Todos", variant: "default" },
    { value: "SENT", label: "Entregados", variant: "success" },
    { value: "FAILED", label: "Fallidos", variant: "error" },
  ];

  return (
    <FilterSection
      icon={<CheckCircle className="w-5 h-5 text-gray-500" />}
      label="Estado:"
    >
      {statusOptions.map((status) => (
        <FilterButton
          key={status.value}
          isActive={selectedStatus === status.value}
          onClick={() => setSelectedStatus(status.value)}
          variant={status.variant}
        >
          {status.label}
        </FilterButton>
      ))}
    </FilterSection>
  );
}