"use client";

import LoginForm from "@/components/forms/loginform";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login as loginService } from "@/lib/auth";
import { showToast } from "@/components/common/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    email: string,
    password: string,
    remember: boolean
  ) => {
    try {
      setLoading(true);
      const response = await loginService(email, password, remember);

      if (response.success) {
        showToast({ type: "success", message: "Inicio de sesión exitoso 🎉" });
        router.push("/dashboard");
      } else {
        showToast({
          type: "error",
          message: response.message || "Error al iniciar sesión",
        });
      }
    } catch (error) {
      console.error("❌ Error inesperado en login:", error);
      showToast({ type: "error", message: "Error inesperado al iniciar sesión" });
    } finally {
      setLoading(false); // 🔥 garantiza que el botón se reactive
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <LoginForm onSubmit={handleLogin} loading={loading} />
      </div>
    </div>
  );
}
