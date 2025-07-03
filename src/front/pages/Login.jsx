import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
// import { Navbar } from "../components/Navbar.jsx";
const backendUrl = import.meta.env.VITE_BACKEND_URL;


const Login = () => {
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginFailed, setLoginFailed] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${backendUrl}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                setLoginFailed(true);
                return;
            }

            const data = await res.json();

            sessionStorage.setItem("token", data.access_token);

            dispatch({
                type: "login_success",
                payload: {
                    token: data.access_token,
                    user: data.user
                }
            });


            // dispatch({
            //     type: "SET_TOKEN",
            //     payload: data.access_token
            // });

            // dispatch({
            //     type: "SET_USER",
            //     payload: data.user
            // });

            const userRoles = data.roles || []; // Usa data.roles (plural), no data.role (singular)

            if (userRoles.includes("client")) { // Verifica si el array incluye "administrator"

                navigate("/private");


            } else if (userRoles.includes("administrator")) { // Verifica si el array incluye "client"
                navigate("/admin");
            } else {
                // Opcional: Maneja casos donde el rol no es 'administrator' ni 'client'
                navigate("/"); // Ruta por defecto si no hay coincidencia de rol específica
                console.warn("Usuario inició sesión con rol(es) no manejado(s):", userRoles);
            }

        } catch (err) {
            console.error("Login failed:", err);
            setLoginFailed(true);
        }
    };

    return (
        <div>
            {/* <Navbar /> */}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                {loginFailed && <p style={{ color: "red" }}>Login failed. Please try again.</p>}
            </form>
        </div>
    );
};

export default Login;