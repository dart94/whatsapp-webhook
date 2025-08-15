// hooks/useUsersCreate.ts
import { useState } from "react";
import { createUser } from "@/lib/users";
import { User } from "@/types/user";

export default function useUsersCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type CreateUserInput = Omit<User, "id">;

  const createUserHandler = async (data: CreateUserInput): Promise<User> => {
    try {
      setError(null);
      const response = await createUser(data); 
      const responseData = response.data as User;
      return responseData;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear usuario";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUserHandler, loading, error };
}