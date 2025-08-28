// /hooks/useGroupsIntegration.ts
import { useCallback, useEffect, useState } from "react";
import { GroupIntegration } from "@/types/groupIntegration";
import { getGroupIntegrations, createGroupIntegration, updateGroupIntegration, deleteGroupIntegration } from "@/lib/groupIntegration";

type UseGroupsReturn = {
  groupIntegrations: GroupIntegration[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addGroupIntegration: (name: string) => Promise<GroupIntegration>;
  editGroupIntegration: (id: number, name: string) => Promise<GroupIntegration>;
  removeGroupIntegration: (id: number) => Promise<void>;
};

export function useGroupsIntegration(): UseGroupsReturn {
  const [groupIntegrations, setGroupIntegrations] = useState<GroupIntegration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupIntegrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const arr = await getGroupIntegrations();     // 👈 ya es GroupIntegration[]
      setGroupIntegrations(arr);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar grupos");
      setGroupIntegrations([]);                     // 👈 estado definido aunque falle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroupIntegrations(); }, [fetchGroupIntegrations]);

  const refresh = useCallback(async () => { await fetchGroupIntegrations(); }, [fetchGroupIntegrations]);

  const addGroupIntegration = useCallback(async (name: string) => {
    const created = await createGroupIntegration(name);
    setGroupIntegrations(prev => [created, ...prev]);
    return created;
  }, []);

  const editGroupIntegration = useCallback(async (id: number, name: string) => {
    const updated = await updateGroupIntegration(id, name);
    setGroupIntegrations(prev => prev.map(g => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const removeGroupIntegration = useCallback(async (id: number) => {
    await deleteGroupIntegration(id);
    setGroupIntegrations(prev => prev.filter(g => g.id !== id));
  }, []);

  return { groupIntegrations, loading, error, refresh, addGroupIntegration, editGroupIntegration, removeGroupIntegration };
}