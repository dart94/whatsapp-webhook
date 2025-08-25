//Validador de grupos
type GroupInput = {
  name: string;
};

export const validateGroupInputFull = (input: GroupInput) => {
  const errors: string[] = [];

  if (!input.name) {
    errors.push("Falta el nombre del grupo.");
  }

  return errors;
};