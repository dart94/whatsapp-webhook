// src/hooks/useGroupsIntegration.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GroupIntegration,
  CreateGroupIntegrationInput,
} from "@/types/groupIntegration";
import {
  getGroupIntegrations,
  createGroupIntegration,
  updateGroupIntegration,
  deleteGroupIntegration,
} from "@/lib/groupIntegration";

type UseGroupsIntegrationReturn = {
  groupIntegrations: GroupIntegration[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addGroupIntegration: (input: CreateGroupIntegrationInput) => Promise<GroupIntegration>;
  editGroupIntegration: (
    id: number,
    input: Partial<CreateGroupIntegrationInput>
  ) => Promise<GroupIntegration>;
  removeGroupIntegration: (id: number) => Promise<void>;
};

export function useGroupsIntegration(): UseGroupsIntegrationReturn {
  const [groupIntegrations, setGroupIntegrations] = useState<GroupIntegration[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupIntegrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const arr = await getGroupIntegrations(); // -> GroupIntegration[]
      setGroupIntegrations(arr);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar integraciones");
      setGroupIntegrations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupIntegrations();
  }, [fetchGroupIntegrations]);

  const refresh = useCallback(async () => {
    await fetchGroupIntegrations();
  }, [fetchGroupIntegrations]);

  const addGroupIntegration = useCallback(
    async (input: CreateGroupIntegrationInput) => {
      const created = await createGroupIntegration(input);
      setGroupIntegrations((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const editGroupIntegration = useCallback(
    async (id: number, input: Partial<CreateGroupIntegrationInput>) => {
      const updated = await updateGroupIntegration(id, input);
      setGroupIntegrations((prev) =>
        prev.map((g) => (g.id === id ? updated : g))
      );
      return updated;
    },
    []
  );

  const removeGroupIntegration = useCallback(async (id: number) => {
    await deleteGroupIntegration(id);
    setGroupIntegrations((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return {
    groupIntegrations,
    loading,
    error,
    refresh,
    addGroupIntegration,
    editGroupIntegration,
    removeGroupIntegration,
  };
}
