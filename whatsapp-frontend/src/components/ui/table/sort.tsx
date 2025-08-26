// /components/ui/table/sort.tsx
import { useState } from "react";

export function useSort<T>(
  data: T[],
  initialSortBy: string,
  initialSortDirection: "asc" | "desc" = "asc"
) {
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  const sortedData = data.sort((a, b) => {
    const aValue = a[sortBy as keyof T];
    const bValue = b[sortBy as keyof T];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue;
    }

    return 0;
  });

  if (sortDirection === "desc") {
    sortedData.reverse();
  }

  return {
    sortedData,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
  };
}