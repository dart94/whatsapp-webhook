"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Inputs";
import { showToast } from "../common/Toast";
import { useAuth } from "../../hooks/useAuth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast({ type: "error", message: "Por favor, completa todos los campos" });
      return;
    }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
      router.push("/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al iniciar sesión";
      showToast({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <Input
          type="email"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <Input
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="flex items-center">
        <input
          id="rememberMe"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="rememberMe" className="text-sm text-gray-700">
          Recuérdame
        </label>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleLogin} disabled={loading}>
          {loading ? "Iniciando..." : "Iniciar sesión"}
        </Button>
      </div>
    </div>
  );
}
