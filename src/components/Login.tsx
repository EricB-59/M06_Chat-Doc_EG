import React, { useState } from "react";

function Login() {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Estados para manejar el estado de los resultados del usuario
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiar mensajes de error/éxito cuando el usuario modifica los campos
    setError(null);
    setSuccess(null);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("Formulario enviado con:", formData);
    e.preventDefault(); // Evita el comportamiento por defecto del form

    // Validación básica en el cliente
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Por favor, complete todos los campos");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLoggedInUser(null);

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // El servidor respondió con un error
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Login exitoso
      console.log("Respuesta del servidor:", data);
      setSuccess("¡Inicio de sesión exitoso!");
      setLoggedInUser(data.user);

      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Respuesta cruda:", response);
      console.log("Datos recibidos:", data);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    setLoggedInUser(null);
    setSuccess(null);
    localStorage.removeItem("user");
  };

  // Si el usuario ya está logueado, mostrar su información
  if (loggedInUser) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Sesión Iniciada
        </h2>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <p className="font-medium text-gray-800 dark:text-white mb-2">
            Bienvenido/a, {loggedInUser.name}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            ID: {loggedInUser.id}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Email: {loggedInUser.email}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full font-bold bg-red-600 rounded-lg px-6 py-3 text-center text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-700 dark:hover:bg-red-800"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-md dark:bg-gray-800">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          ></label>
          <input
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            type="text"
            name="name"
            id="name"
            placeholder="Tu nombre"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          ></label>
          <input
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            type="email"
            name="email"
            id="email"
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <button
          className="w-full font-bold bg-blue-700 rounded-lg px-6 py-3.5 text-center text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Procesando..." : "INICIAR SESIÓN"}
        </button>
      </form>
    </div>
  );
}

export default Login;
