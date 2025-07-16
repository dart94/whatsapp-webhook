import { useEffect, useState } from "react";
import { getUnreadCounts } from "../lib/conversation.api";

export function useUnreadCounts() {
  const [unreadCounts, setUnreadCounts] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUnreadCounts();
      setUnreadCounts(data);
    };

    fetchData();
  }, []);

  return unreadCounts;
}