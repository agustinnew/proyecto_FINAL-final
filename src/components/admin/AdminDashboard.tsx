import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { authRepository } from "../../repositories/authRepository";
import type { CreateUserInput, UserRecord, UserRole } from "../../types/auth";

type ManagedRole = Exclude<UserRole, "ADMIN">;

const labels: Record<ManagedRole, string> = {
  ALUMNO: "Alumnos",
  PROFESOR: "Profesores",
};

const emptyForm = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  CI: "",
  password: "",
};

function fullName(user: UserRecord) {
  return `${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`;
}

function AdminDashboard() {
  const [role, setRole] = useState<ManagedRole>("ALUMNO");
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<UserRecord[]>(() => [
    ...authRepository.getUsersByRole("ALUMNO"),
    ...authRepository.getUsersByRole("PROFESOR"),
  ]);

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const roleUsers = users.filter((user) => user.rol === role);

    if (!normalizedQuery) return roleUsers;

    return roleUsers.filter((user) =>
      `${fullName(user)} ${user.CI}`.toLocaleLowerCase().includes(normalizedQuery)
    );
  }, [query, role, users]);

  const refreshUsers = () => {
    setUsers([
      ...authRepository.getUsersByRole("ALUMNO"),
      ...authRepository.getUsersByRole("PROFESOR"),
    ]);
  };

  const selectRole = (nextRole: ManagedRole) => {
    setRole(nextRole);
    setQuery("");
    setError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const result = authRepository.createUser({ ...form, rol: role } as CreateUserInput);
    if (result.error) {
      setError(result.error);
      return;
    }

    refreshUsers();
    setForm(emptyForm);
    setIsFormOpen(false);
  };

  const handleDeactivate = (user: UserRecord) => {
    if (!window.confirm(`¿Deseas dar de baja a ${fullName(user)}?`)) return;

    authRepository.deactivateUser(user.id);
    refreshUsers();
  };

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <div className="admin-dashboard__intro">
        <span>Panel de administrador</span>
        <h1 id="admin-dashboard-title">Gestión de usuarios</h1>
        <p>Registra y administra alumnos y profesores del Colegio Don Bosco Sucre.</p>
      </div>

      <div className="admin-dashboard__tabs" role="tablist" aria-label="Usuarios a gestionar">
        {(Object.keys(labels) as ManagedRole[]).map((item) => (
          <button
            aria-selected={role === item}
            className={role === item ? "admin-dashboard__tab admin-dashboard__tab--active" : "admin-dashboard__tab"}
            key={item}
            onClick={() => selectRole(item)}
            role="tab"
            type="button"
          >
            {labels[item]}
          </button>
        ))}
      </div>

      <section className="admin-users" aria-label={`Lista de ${labels[role].toLocaleLowerCase()}`}>
        <div className="admin-users__toolbar">
          <div>
            <span>{labels[role]}</span>
            <h2>{visibleUsers.length} registrado{visibleUsers.length === 1 ? "" : "s"}</h2>
          </div>
          <button className="admin-users__add" onClick={() => setIsFormOpen(true)} type="button">
            + Añadir {role === "ALUMNO" ? "alumno" : "profesor"}
          </button>
        </div>

        <label className="admin-users__search">
          <span>Buscar por nombre o CI</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar ${labels[role].toLocaleLowerCase()}...`}
            type="search"
            value={query}
          />
        </label>

        {isFormOpen && (
          <form className="admin-user-form" onSubmit={handleSubmit}>
            <div className="admin-user-form__header">
              <div>
                <span>Nuevo {role === "ALUMNO" ? "alumno" : "profesor"}</span>
                <h3>Datos del usuario</h3>
              </div>
              <button onClick={() => { setIsFormOpen(false); setError(""); }} type="button">Cancelar</button>
            </div>
            {(["nombre", "apellidoPaterno", "apellidoMaterno", "CI", "password"] as const).map((field) => (
              <label key={field}>
                {{ nombre: "Nombre", apellidoPaterno: "Apellido paterno", apellidoMaterno: "Apellido materno", CI: "CI", password: "Contraseña" }[field]}
                <input
                  autoComplete={field === "password" ? "new-password" : "off"}
                  onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                  required
                  type={field === "password" ? "password" : "text"}
                  value={form[field]}
                />
              </label>
            ))}
            {error && <p className="admin-user-form__error" role="alert">{error}</p>}
            <button className="admin-users__add" type="submit">Guardar usuario</button>
          </form>
        )}

        <div className="admin-users__table-wrapper">
          <table>
            <thead><tr><th>Nombre completo</th><th>CI</th><th>Rol</th><th>Acción</th></tr></thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td><strong>{fullName(user)}</strong></td>
                  <td>{user.CI}</td>
                  <td><span className="admin-users__role">{role === "ALUMNO" ? "Alumno" : "Profesor"}</span></td>
                  <td><button className="admin-users__remove" onClick={() => handleDeactivate(user)} type="button">Dar de baja</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleUsers.length === 0 && <p className="admin-users__empty">No se encontraron {labels[role].toLocaleLowerCase()} activos.</p>}
        </div>
      </section>
    </section>
  );
}

export default AdminDashboard;
