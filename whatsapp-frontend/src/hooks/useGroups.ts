// /hooks/useGroups.ts
import { useCallback, useEffect, useState } from "react";
import { Group } from "@/types/groups";
import { getGroups, createGroup, updateGroup, deleteGroup } from "@/lib/group";

type UseGroupsReturn = {
  groups: Group[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addGroup: (name: string) => Promise<Group>;
  editGroup: (id: number, name: string) => Promise<Group>;
  removeGroup: (id: number) => Promise<void>;
};

export function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const arr = await getGroups();     // 👈 ya es Group[]
      setGroups(arr);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar grupos");
      setGroups([]);                     // 👈 estado definido aunque falle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const refresh = useCallback(async () => { await fetchGroups(); }, [fetchGroups]);

  const addGroup = useCallback(async (name: string) => {
    const created = await createGroup(name);
    setGroups(prev => [created, ...prev]);
    return created;
  }, []);

  const editGroup = useCallback(async (id: number, name: string) => {
    const updated = await updateGroup(id, name);
    setGroups(prev => prev.map(g => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const removeGroup = useCallback(async (id: number) => {
    await deleteGroup(id);
    setGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  return { groups, loading, error, refresh, addGroup, editGroup, removeGroup };
}