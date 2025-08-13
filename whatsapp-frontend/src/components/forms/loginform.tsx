import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Input } from "../ui/Inputs";
import { Button } from "../ui/Button";

interface LoginFormProps {
  onSubmit: (email: string, password: string, remember: boolean) => Promise<void>;
  loading?: boolean;
  errorMessage?: string;
}

export default function LoginForm({ onSubmit, loading, errorMessage }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password, rememberMe);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
      <div className="text-center">
        <img src="/icons8.png" alt="Logo" className="mx-auto h-12 w-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
        <p className="text-sm text-gray-500 mt-1">Bienvenido de vuelta, ingresa tus datos</p>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-sm text-center">{errorMessage}</div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm">
          <input
            name="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-gray-700">Recuérdame</span>
        </label>
        {/* <a href="/forgot" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ¿Olvidaste tu contraseña?
        </a> */}
      </div>

      <div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3"
        >
          {loading ? "Cargando..." : "Iniciar sesión"}
        </Button>
      </div>

      {/* <p className="text-center text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <a href="/register" className="font-medium text-blue-600 hover:text-blue-700">
          Regístrate
        </a>
      </p> */}
    </form>
  );
}