"use client";

import LoginForm from "@/components/forms/loginform";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const handleLogin = async (email: string, password: string, remember: boolean) => {
    setLoading(true);
    setError(null);
    try {
      // Llamada a tu API de autenticación
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          errorMessage={error || undefined}
        />
      </div>
    </div>
  );
}