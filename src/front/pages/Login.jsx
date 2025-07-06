// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
// import { Navbar } from "../components/Navbar.jsx";
// const backendUrl = import.meta.env.VITE_BACKEND_URL;


// const Login = () => {
//     const navigate = useNavigate();
//     const { dispatch } = useGlobalReducer();

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [loginFailed, setLoginFailed] = useState(false);

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await fetch(`${backendUrl}/api/login`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({ email, password })
//             });

//             if (!res.ok) {
//                 setLoginFailed(true);
//                 return;
//             }

//             const data = await res.json();

//             sessionStorage.setItem("token", data.access_token);

//             // dispatch({
//             //     type: "SET_TOKEN",
//             //     payload: data.access_token
//             // });

//             // dispatch({
//             //     type: "SET_USER",
//             //     payload: data.user
//             // });

//             const userRoles = data.roles || []; // Usa data.roles (plural), no data.role (singular)

//             if (userRoles.includes("client")) { 
//                 navigate("/privatehome");
//             } else if (userRoles.includes("administrator")) { 
//                 navigate("/admin");
//             } else {

//                 navigate("/"); 
//                 console.warn("Usuario inició sesión con rol(es) no manejado(s):", userRoles);
//             }

//         } catch (err) {
//             console.error("Login failed:", err);
//             setLoginFailed(true);
//         }
//     };

//     return (
//         <div>
//             <Navbar />
//             <form onSubmit={handleLogin}>
//                 <div>
//                     <label>Email:</label>
//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Password:</label>
//                     <input
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <button type="submit">Login</button>
//                 {loginFailed && <p style={{ color: "red" }}>Login failed. Please try again.</p>}
//             </form>
//         </div>
//     );
// };

// export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Navbar } from '../components/Navbar';

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
    

    if (!data.access_token || data.access_token.split('.').length !== 3) {
      throw new Error("Invalid JWT token received from server");
    }

    dispatch({
      type: "login_success",
      payload: {
        token: data.access_token,
        user: data.user
      }
    });

   
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    const userRoles = data.roles || [];
    if (userRoles.includes("client")) {
      navigate("/privatehome");
    } else if (userRoles.includes("administrator")) {
      navigate("/privatehome");
    } else {
      navigate("/");
      console.warn("Unidentified role:", userRoles);
    }
  } catch (err) {
    console.error("Login error:", err);
    setLoginFailed(true);
   
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

  return (
    <div>
    <Navbar/>
            <div className="d-flex justify-content-center align-items-center my-4 signup-form">
    <form className="container card row" style={{ width: "100%", maxWidth: "800px" }} onSubmit={handleLogin}>
      <div className=" mt-2 col-12">
        <label className="form-label">Email:</label>
        <input className="form-control"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className=" mt-2 col-12">
        <label className="form-label">Password:</label>
        <input className="form-control"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="col-12 my-2 d-flex justify-content-center">
      <button  className="btn signup " type="submit">Login</button>
      {loginFailed && (
        <p style={{ color: "red" }}>Login failed. Please try again.</p>
      )}
      </div>
    </form>
    </div>
</div>
  );
};

export default Login;