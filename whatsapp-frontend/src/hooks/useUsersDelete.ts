// useUsersDelete.ts
import { useState } from "react";
import { deleteUser } from "@/lib/users";

export default function useUsersDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUserHandler = async (id: number) => {
    try {
      setLoading(true);
      const response = await deleteUser(id);
      console.log("Usuario eliminado:", response.data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar usuario");
      setLoading(false);
    }
  };

  return { deleteUserHandler, loading, error };
}
