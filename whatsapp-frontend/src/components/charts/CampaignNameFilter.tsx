import { Target } from "lucide-react";
import FilterButton from "./filters/FilterButton";
import FilterSection from "./filters/FilterSection";


interface CampaignFilterProps {
  campaigns: string[];
  selectedCampaign: string;
  setSelectedCampaign: (value: string) => void;
}

export function CampaignFilter({
  campaigns,
  selectedCampaign,
  setSelectedCampaign,
}: CampaignFilterProps) {
  return (
    <FilterSection
      icon={<Target className="w-5 h-5 text-gray-500" />}
      label="Campañas:"
    >
      <FilterButton
        isActive={selectedCampaign === "all"}
        onClick={() => setSelectedCampaign("all")}
      >
        Todas las campañas
      </FilterButton>
      
      {campaigns.map((campaign) => (
        <FilterButton
          key={campaign}
          isActive={selectedCampaign === campaign}
          onClick={() => setSelectedCampaign(campaign)}
        >
          {campaign}
        </FilterButton>
      ))}
    </FilterSection>
  );
}