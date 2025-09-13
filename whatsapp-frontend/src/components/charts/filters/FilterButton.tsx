import React from 'react';

interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  isActive, 
  onClick, 
  children, 
  variant = 'default' 
}) => {
  const getVariantClasses = () => {
    if (!isActive) {
      return "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300";
    }
    
    switch (variant) {
      case 'success':
        return "bg-green-50 text-green-700 border-green-200 shadow-sm";
      case 'error':
        return "bg-red-50 text-red-700 border-red-200 shadow-sm";
      case 'warning':
        return "bg-amber-50 text-amber-700 border-amber-200 shadow-sm";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 shadow-sm";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border
        flex items-center gap-1
        ${getVariantClasses()}
      `}
    >
      {children}
      {isActive && <span className="text-xs">✓</span>}
    </button>
  );
};

export default FilterButton;