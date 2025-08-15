import { useState } from "react";
import { updateUser } from "@/lib/users";
import { User, UpdateUserInput } from "@/types/user";

export default function useUsersUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type UpdateUserInput = Omit<User, "id">;

  const updateUserHandler = async (id: number , data: UpdateUserInput): Promise<User> => {
    try {
      setError(null);
      const response = await updateUser(id as number, data);
      const responseData = response.data as User;
      return responseData;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar usuario";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateUserHandler, loading, error };
}