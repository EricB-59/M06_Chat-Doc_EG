import React, { useState } from "react";

function Login() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault(); // Evita el comportamiento por defecto del form

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al enviar los datos");
      }

      const data = await response.json();
      console.log("Respuesta del servidor:", data);
    } catch (error) {
      console.error("Error desconocido");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          className="mb-4 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          type="text"
          name="name"
          id="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          className="mb-4 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          type="text"
          name="email"
          id="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <button
          className="font bg-blue-700 inline-block rounded-lg bg-primary-700 px-6 py-3.5 text-center font-extrabold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          type="submit"
        >
          SEND
        </button>
      </form>
    </div>
  );
}

export default Login;
