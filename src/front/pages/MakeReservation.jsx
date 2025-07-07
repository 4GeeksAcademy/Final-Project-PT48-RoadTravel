import React, { useEffect, useState } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate, useParams } from 'react-router-dom';
import { NavbarForUsers } from '../components/NavbarForUsers';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function MakeReservation() {
    // const fav = store.favorites.some(f => f.license_plate === vehicle.license_plate);
    const { store } = useGlobalReducer();
    const {id, type} = useParams();
    const navigate = useNavigate();
    const [reservationData, setReservationData] = useState({
        model: "",
        licensePlate: "",
        startDate: "",
        endDate: "",
        licenseNumber: "",
        price: ""
    });
    useEffect(() => {
        
        if (store[type].length > 0 && store.startDates && store.endDates) {
            const car = store[type].find(item => item.license_plate == id);
            console.log(car);
            
            const startDate = store.startDates; 
            const endDate = store.endDates;    
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);
            const diffTime = Math.abs(date2 - date1);
            
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            setReservationData({
                model: car.model,
                licensePlate: car.license_plate,
                startDate: startDate,
                endDate: endDate,
                licenseNumber: '',
                price: car.price * diffDays
            });
            console.log(car.amount);
            
        }
    }, [store.subcompact, store.premium, store.medium, store.startDates, store.endDates]); 
    console.log(reservationData);
    
    const handleChange = (e) => {
        setReservationData({
            ...reservationData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must log in to make a reservation.");
            return;
        }
        console.log(reservationData);
        
        const bookingPayload = {
            car_id: id,
            location: "Online",
            car_model: reservationData.model,
            amount: reservationData.price,
            start_day: reservationData.startDate,
            end_day: reservationData.endDate,
            license_number: reservationData.licenseNumber
        };
        try {
            const res = await fetch(`${backendUrl}/api/my-reservation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(bookingPayload)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || "Error creating reservation");
            }
            const data = await res.json();
            const reservationId = data.new_booking.id;
            navigate(`/bookinglist`);
        } catch (err) {
            console.error("Error:", err);
            alert(err.message || "Error confirming reservation.");
        }
    };
    return (
        <div>
           
            <NavbarForUsers index="privatehome" booking="bookinglist" />
             <div className="d-flex justify-content-center align-items-center my-4 signup-form">
        <form  onSubmit={handleSubmit} className="row g-3 d-flex justify-content-center align-items-center my-4 container card no-direction">
            <div className="col-md-9">
                <label className="form-label">Car Model</label>
                <input type="text" className="form-control" value={reservationData.model} readOnly />
            </div>
            <div className="col-md-3">
                <label className="form-label">License Plate</label>
                <input type="text" className="form-control" value={reservationData.licensePlate} readOnly />
            </div>
            <div className="col-md-6">
                <label className="form-label">Start Day</label>
                <input type="date" className="form-control" value={reservationData.startDate} readOnly />
            </div>
            <div className="col-md-6">
                <label className="form-label">End Day</label>
                <input type="date" className="form-control" value={reservationData.endDate} readOnly />
            </div>
            <div className="col-md-9">
                <label className="form-label">License Number</label>
                <input
                    type="text"
                    className="form-control"
                    name="licenseNumber"
                    value={reservationData.licenseNumber}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-md-3">
                <label className="form-label">Total Pricing</label>
                <input type="text" className="form-control" value={`$${reservationData.price}`} readOnly />
            </div>
            <div className="col-12 mb-2 d-flex justify-content-center">
                <button type="submit" className="btn signup">Confirm</button>
            </div>
        </form>
        </div>
        </div>
    );
};