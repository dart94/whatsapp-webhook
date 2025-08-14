import { useState, useEffect } from "react";
import { getUsers } from "@/lib/users";
import { User } from "@/types/user";
export default function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers();
        // Asegurar que tomamos el arreglo correcto
        setUsers(Array.isArray(response.data) ? response.data : []);
        console.log("Usuarios obtenidos:", response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener usuarios");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return { users, loading, error };
}
