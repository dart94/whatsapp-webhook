// hooks/useUsers.ts
import { useState, useEffect, useCallback } from "react";
import { getUsers } from "@/lib/users";
import { User } from "@/types/user";

export default function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { 
    users, 
    loading, 
    error,
    refresh: fetchUsers
}
}