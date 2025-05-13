import React, { useState } from "react";

function Login() {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!data) {
      // El servidor respondió con un error
      throw new Error(data.message || "Error al iniciar sesión");
    }

    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
      window.location.replace("http://localhost:4321/app");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-md bg-gray-800 my-10">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-white"
          ></label>
          <input
            className="block w-[90%] rounded-lg border border-gray-300 bg-gray-700 px-4 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            type="text"
            name="name"
            id="name"
            placeholder="Tu nombre"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-white"
          ></label>
          <input
            className="block w-[90%] rounded-lg border border-gray-300 bg-gray-700 px-4 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            type="email"
            name="email"
            id="email"
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <button
          className="w-[87%] font-bold bg-blue-600 rounded-lg px-6 py-3.5 text-center text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-800 disabled:bg-blue-400"
          type="submit"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

export default Login;
