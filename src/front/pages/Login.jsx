import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [loginFailed, setLoginFailed] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginSuccess(false);
        setLoginFailed(false);

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

            setLoginSuccess(true);

            const userRoles = data.roles || [];
            if (userRoles.includes("client")) {
                navigate("/private");
            } else if (userRoles.includes("administrator")) {
                navigate("/admin");
            } else {
                navigate("/");
            }

        } catch (err) {
            console.error("Login failed:", err);
            setLoginFailed(true);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "600px" }}>
            <form onSubmit={handleLogin} className="card p-4 shadow-sm">
                <h3 className="mb-4">Login</h3>

                {loginSuccess && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        Login successful!
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                )}

                {loginFailed && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        Login failed. Please check your credentials and try again.
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
        </div>
    );
};

export default Login;