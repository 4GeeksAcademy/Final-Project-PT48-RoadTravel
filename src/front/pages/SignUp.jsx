import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom"; // Link es para navegar con tags <Link>, no para redireccionar programáticamente. Está bien si lo usas en otras partes.
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export function SignUp() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        phone: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const navigate = useNavigate(); // Inicializa useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault(); // Siempre lo primero en handleSubmit
        console.log("Datos del formulario a enviar:", formData); // Para depuración

        try {
            const resp = await fetch(backendUrl + "/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await resp.json(); // Parsea la respuesta JSON

            if (resp.ok) {
                alert("¡Registro exitoso!");

                // ASUMO que tu backend devuelve un objeto user con el rol, por ejemplo:
                // { message: "Successful registration!", user: { id: 1, email: "...", role: "client" } }
                // O directamente { role: "client" }
                
                // *** Paso Clave 1: Acceder al rol del usuario en la respuesta ***
                // Es muy importante que tu backend realmente devuelva 'data.user.role' o 'data.role'
                const userRole = data.user ? data.user.role : null; 
                console.log("Rol del usuario recibido:", userRole); // Para depuración

                // *** Paso Clave 2: Redirigir según el rol ***
                if (userRole === "client") { 
                    navigate("/"); 
                } 
                else {
                    // Si el rol no es "client", o si no se recibe un rol claro,
                    // puedes redirigir a una página predeterminada (ej. inicio o un dashboard general).
                    navigate("/"); 
                }

            } else {
                alert(data.message || "¡Error en el registro! Inténtalo de nuevo."); 
            }
        } catch (err) {
            console.error("Error del servidor al registrar:", err); // Mensaje más específico
            alert("¡Error del servidor! No se pudo completar el registro.");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center my-4">
            {/* Aplica onSubmit al formulario */}
            <form className="container card" style={{ width: "100%", maxWidth: "800px" }} onSubmit={handleSubmit}>
                <div className="row mt-2">
                    <div className="col-6">
                        {/* Asegúrate de que el 'for' en label coincida con el 'id' del input */}
                        <label htmlFor="inputEmail4" className="form-label">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" id="inputEmail4" />
                    </div>
                    <div className="col-6">
                        <label htmlFor="inputPassword4" className="form-label">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" id="inputPassword4" />
                    </div>
                </div>
                <div className="col-12">
                    <label htmlFor="inputFullName" className="form-label">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" id="inputFullName" placeholder="Full Name" />
                </div>
                <div className="col-12">
                    <label htmlFor="inputAddress" className="form-label">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" id="inputAddress" placeholder="123 Main ST" />
                </div>
                <div className="row">
                    <div className="col-6">
                        <label htmlFor="inputPhone" className="form-label">Phone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" id="inputPhone" /> {/* Cambiado a type="tel" para teléfonos */}
                    </div>
                </div>
                
                <div className="col-12 mb-2 d-flex justify-content-center">
                    {/* Quita el onClick de aquí, el onSubmit del form ya lo manejará */}
                    <button type="submit" className="btn btn-primary">Sign up</button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;