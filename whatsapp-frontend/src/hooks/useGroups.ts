// /hooks/useGroups.ts
import { useCallback, useEffect, useState } from "react";
import { Group } from "@/types/groups";
import { getGroups, createGroup, updateGroup, deleteGroup } from "@/lib/group";

type UseGroupsReturn = {
  groups: Group[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addGroup: (name: string, token: string) => Promise<Group>;
  editGroup: (id: number, name: string) => Promise<Group>;
  removeGroup: (id: number) => Promise<void>;
};

export function useGroups(token: string | null): UseGroupsReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        setError("No hay token disponible");
        setGroups([]);
        return;
      }
      const arr = await getGroups(token);   // ✅ ahora pasamos token
      setGroups(arr);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar grupos");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const refresh = useCallback(async () => { await fetchGroups(); }, [fetchGroups]);

  const addGroup = useCallback(async (name: string, token: string) => {
    if (!token) throw new Error("No hay token");
    const created = await createGroup(name, token);
    setGroups(prev => [...prev, created]);
    return created;
  }, []);

  const editGroup = useCallback(async (id: number, name: string) => {
    if (!token) throw new Error("No hay token");
    const updated = await updateGroup(id, name);
    setGroups(prev => prev.map(g => (g.id === id ? updated : g)));
    return updated;
  }, [token]);

  const removeGroup = useCallback(async (id: number) => {
    if (!token) throw new Error("No hay token");
    await deleteGroup(id);
    setGroups(prev => prev.filter(g => g.id !== id));
  }, [token]);

  return { groups, loading, error, refresh, addGroup, editGroup, removeGroup };
}