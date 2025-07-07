import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom"; 
import { Navbar } from '../components/Navbar';
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

    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        console.log("Form data to be sent:", formData); 

        try {
            const resp = await fetch(backendUrl + "/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await resp.json(); 

            if (resp.ok) {
                alert("Registration successful!");

              
                const userRole = data.user ? data.user.role : null;
                console.log("User role received:", userRole); 

           
                if (userRole === "client") {
                    navigate("/");
                }
                else {
                  
                    navigate("/");
                }

            } else {
                alert(data.message || "Registration failed! Please try again..");
            }
        } catch (err) {
            console.error("Server error while registering:", err); 
            alert("Server error! Registration could not be completed..");
        }
    };

    return (
        <div>
            <Navbar/>
        <div className="d-flex justify-content-center align-items-center my-4 signup-form">
            
            <form className="container card" style={{ width: "100%", maxWidth: "800px" }} onSubmit={handleSubmit}>
                <div className="row mt-2">
                    <div className="col-6">
                     
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
                <div className='row'>
                <div className="col-6">
                    <label htmlFor="inputAddress" className="form-label">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" id="inputAddress" placeholder="123 Main ST" />
                </div>
                <div className="col-6">
                    <label htmlFor="inputPhone" className="form-label">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" id="inputPhone" /> {/* Cambiado a type="tel" para teléfonos */}
                </div>
                </div>

                <div className="col-12 my-2 d-flex justify-content-center">
                  
                    <button type="submit" className="btn signup ">Sign up</button>
                </div>
            </form>
        </div>
        </div>
    );
};

export default SignUp;