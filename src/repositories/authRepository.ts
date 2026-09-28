import initialUsers from "../data/users.json";
import { storageService } from "../services/storageService";
import type { CreateUserInput, LoginCredentials, User, UserRecord, UserRole } from "../types/auth";

const SESSION_KEY = "app_session";
const USERS_KEY = "kardex_users";
const initialUserRecords = initialUsers as UserRecord[];

function getUsers(): UserRecord[] {
  const storedUsers = storageService.get<UserRecord[]>(USERS_KEY);

  if (storedUsers) return storedUsers;

  const users = initialUserRecords.map((user) => ({ ...user, activo: user.activo ?? true }));
  storageService.set(USERS_KEY, users);
  return users;
}

function saveUsers(users: UserRecord[]) {
  storageService.set(USERS_KEY, users);
}

function toSessionUser(user: UserRecord): User {
  const { password: _password, activo: _activo, ...sessionUser } = user;
  return sessionUser;
}

export const authRepository = {
  login(credentials: LoginCredentials): User | null {
    const foundUser = getUsers().find(
      (user) =>
        user.CI === credentials.CI &&
        user.password === credentials.password &&
        user.rol === credentials.rol &&
        user.activo !== false
    );

    if (!foundUser) return null;

    const sessionUser = toSessionUser(foundUser);

    storageService.set<User>(SESSION_KEY, sessionUser);
    return sessionUser;
  },

  getCurrentUser(): User | null {
    return storageService.get<User>(SESSION_KEY);
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  logout(): void {
    storageService.remove(SESSION_KEY);
  },

  getUsersByRole(rol: Exclude<UserRole, "ADMIN">): UserRecord[] {
    return getUsers().filter((user) => user.rol === rol && user.activo !== false);
  },

  createUser(input: CreateUserInput): { user?: UserRecord; error?: string } {
    const users = getUsers();
    const CI = input.CI.trim();

    if (users.some((user) => user.CI === CI)) {
      return { error: "Ya existe un usuario registrado con ese CI." };
    }

    const newUser: UserRecord = {
      id: `${input.rol.toLowerCase()}-${Date.now()}`,
      nombre: input.nombre.trim(),
      apellidoPaterno: input.apellidoPaterno.trim(),
      apellidoMaterno: input.apellidoMaterno.trim(),
      CI,
      password: input.password,
      rol: input.rol,
      activo: true,
    };

    saveUsers([...users, newUser]);
    return { user: newUser };
  },

  deactivateUser(id: string): void {
    saveUsers(
      getUsers().map((user) =>
        user.id === id ? { ...user, activo: false } : user
      )
    );
  },
};
