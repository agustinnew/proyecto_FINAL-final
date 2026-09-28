import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";


import LoginForm from "../auth/LoginForm";
import { authRepository } from "../../repositories/authRepository";


import type { LoginCredentials } from "../../types/auth";


function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");


  if (authRepository.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }


  const handleLogin = (credentials: LoginCredentials) => {
    setError("");


    const user = authRepository.login(credentials);


    if (!user) {
      setError("El CI, la contraseña o el rol seleccionado son incorrectos.");
      return;
    }


    navigate("/", { replace: true });
  };


  return (
    <main className="login-page">
      <LoginForm
        error={error}
        onSubmit={handleLogin}
      />
    </main>
  );
}


export default LoginPage;
