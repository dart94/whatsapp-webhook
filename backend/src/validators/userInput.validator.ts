type UserInput = {
  name: string;
  email: string;
  password: string;
};

export function validateUserInputFull({ name, email, password }: UserInput): string[] {
  const errors: string[] = [];

  if (!name || !email || !password) {
    errors.push("Faltan campos requeridos.");
    return errors;
  }

  if (name.trim().length < 3) {
    errors.push("El nombre debe tener al menos 3 caracteres.");
  }

  if (email.trim().length < 5 || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("El email no es válido.");
  }

  if (password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres.");
  }

  return errors;
}
