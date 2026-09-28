import { useState } from "react";
import type { FormEventHandler } from "react";
import type { LoginCredentials, UserRole } from "../../types/auth";

interface LoginFormProps {
  error?: string;
  onSubmit: (credentials: LoginCredentials) => void;
}

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: "Profesor", value: "PROFESOR" },
  { label: "Alumno", value: "ALUMNO" },
  { label: "Administrador", value: "ADMIN" },
];

function LoginForm({ error, onSubmit }: LoginFormProps) {
  const [CI, setCI] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<UserRole>("ALUMNO");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const normalizedCI = CI.trim();

    if (!normalizedCI || !password || !rol) return;

    onSubmit({ CI: normalizedCI, password, rol });
  };

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <img
        className="login-card__shield"
        src="/donbosco-sucre-shield.svg"
        alt="Escudo del Colegio Don Bosco Sucre"
      />
      <span className="login-card__eyebrow">Kardex académico</span>
      <h1>Iniciar sesión</h1>
      <p className="login-card__subtitle">
        Seleccione su rol e ingrese con su CI y contraseña.
      </p>

      <fieldset className="login-card__roles" aria-label="Seleccione su rol">
        {roleOptions.map((option) => (
          <label key={option.value} className="login-card__role-option">
            <input
              type="radio"
              name="rol"
              value={option.value}
              checked={rol === option.value}
              onChange={() => setRol(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <div className="login-card__field">
        <label htmlFor="CI">CI</label>
        <input
          id="CI"
          name="CI"
          type="text"
          value={CI}
          onChange={(event) => setCI(event.target.value)}
          placeholder="Ingrese su CI"
          autoComplete="username"
          required
        />
      </div>

      <div className="login-card__field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Ingrese su contraseña"
          autoComplete="current-password"
          required
        />
      </div>

      {error && <p className="login-card__error" role="alert">{error}</p>}
      <button type="submit">Ingresar</button>
    </form>
  );
}

export default LoginForm;
