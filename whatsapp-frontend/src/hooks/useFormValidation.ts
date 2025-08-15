import { useMemo, useState } from "react";

type FormData = {
  name?: string;
  email?: string;
  password?: string; // opcional en edición
};

type Options = {
  requirePassword?: boolean;     // create: true, edit: false
  minNameLength?: number;
  minPasswordLength?: number;
  validateEmail?: boolean;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function useFormValidation(
  userData: FormData,
  {
    requirePassword = true,
    minNameLength = 2,
    minPasswordLength = 8,
    validateEmail = true,
  }: Options = {}
) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errorsMap = useMemo(() => {
    const name = (userData?.name ?? "").trim();
    const email = (userData?.email ?? "").trim();
    const pass = userData?.password ?? "";

    return {
      name:
        name.length < minNameLength
          ? `Escribe al menos ${minNameLength} caracteres`
          : "",
      email:
        validateEmail && !emailRegex.test(email) ? "Email no válido" : "",
      // En edición, solo valida si escriben algo; en creación es obligatorio
      password: requirePassword
        ? pass.length < minPasswordLength
          ? `La contraseña debe tener mínimo ${minPasswordLength} caracteres`
          : ""
        : pass.length > 0 && pass.length < minPasswordLength
        ? `La contraseña debe tener mínimo ${minPasswordLength} caracteres`
        : "",
    } as Record<string, string>;
  }, [
    userData?.name,
    userData?.email,
    userData?.password,
    requirePassword,
    minNameLength,
    minPasswordLength,
    validateEmail,
  ]);

  const hasErrors = Object.values(errorsMap).some(Boolean);

  return { touched, setTouched, errorsMap, hasErrors };
}
