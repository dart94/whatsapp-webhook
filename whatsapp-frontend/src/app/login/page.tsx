"use client";

import LoginForm from "@/components/forms/loginform";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login as loginService } from "@/lib/auth";


export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const handleLogin = async (
    email: string,
    password: string,
    remember: boolean,
  ) => {
    setLoading(true);
    setError(null);
    const response = await loginService(email, password, remember);
    if (response.success) {
      router.push('/dashboard');
    } else {
      setError(response.message || 'Error al iniciar sesión');
      console.error(response);
    }
    setLoading(false);
  }

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