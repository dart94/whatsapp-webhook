interface FilterSectionProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ icon, label, children }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-gray-700">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
};

export default FilterSection;