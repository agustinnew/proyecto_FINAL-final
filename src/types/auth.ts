export type UserRole = "ADMIN" | "PROFESOR" | "ALUMNO";

export interface User {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  CI: string;
  rol: UserRole;
}

export interface UserRecord extends User {
  password: string;
  activo?: boolean;
}

export interface LoginCredentials {
  CI: string;
  password: string;
  rol: UserRole;
}

export interface CreateUserInput {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  CI: string;
  password: string;
  rol: Exclude<UserRole, "ADMIN">;
}
