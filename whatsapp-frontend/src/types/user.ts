export interface User {
  id: number;
  name: string;
  email: string;
  password: string; 
  isAdmin: boolean;
  IsActive: boolean;
}

export type CreateUserInput = Omit<User, "id">;
export type UpdateUserInput = Partial<Omit<User, "id">>;
export type UserUpdateData = Omit<User, 'id' | 'password'> & {
  password?: string;
};
