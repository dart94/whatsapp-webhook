import { useState } from "react";
import { createUser } from "@/lib/users";
import { User } from "@/types/user";

export default function useUsersCreate() {
  const [user, setUser] = useState<User>({
    id: "",
    name: "",
    email: "",
    password: "",
    isAdmin: false,
    IsActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUserHandler = async (data: User) => {
    try {
      setLoading(true);
      const response = await createUser(data);
      console.log("Usuario creado:", response.data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
      setLoading(false);
    }
  };

  return { user, createUserHandler, loading, error };
}