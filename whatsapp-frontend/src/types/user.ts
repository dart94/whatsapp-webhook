export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  IsActive?: boolean;
  role: "admin" | "user";
}


export type CreateUserInput = Omit<User, "id">;
export type UpdateUserInput = Partial<Omit<User, "id">>;
export type UserUpdateData = Omit<User, 'id' | 'password'> & {
  password?: string;
};


// Tipo para la respuesta de la API de login
export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token?: string;
  };
}

// Tipo para la respuesta de validación de token
export interface TokenValidationResponse {
  success: boolean;
  user?: User;
}