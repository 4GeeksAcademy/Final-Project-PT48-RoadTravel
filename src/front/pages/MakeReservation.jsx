import React, { useEffect, useState } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function MakeReservation() {
    const { store } = useGlobalReducer();
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
        // Asegúrate de que store.favorites tenga un coche y que las fechas estén disponibles
        if (store.favorites.length > 0 && store.startDates && store.endDates) {
            const car = store.favorites[0];

            const startDate = store.startDates; // Accede directamente a la cadena de fecha
            const endDate = store.endDates;     // Accede directamente a la cadena de fecha

            const date1 = new Date(startDate);
            const date2 = new Date(endDate);
            const diffTime = Math.abs(date2 - date1);
            // Asegúrate de que diffDays sea al menos 1, incluso para reservas del mismo día
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

            setReservationData({
                model: car.model,
                licensePlate: car.license_plate,
                startDate: startDate,
                endDate: endDate,
                licenseNumber: '',
                price: car.amount * diffDays
            });
        }
    }, [store.favorites, store.startDates, store.endDates]); // Añade dependencias a useEffect

    const handleChange = (e) => {
        setReservationData({
            ...reservationData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const car = store.favorites[0];
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Debes iniciar sesión para hacer una reserva.");
            return;
        }

        const bookingPayload = {
            car_id: car.license_plate,
            location: "Online",
            car_model: reservationData.model,
            amount: reservationData.price,
            start_day: reservationData.startDate,
            end_day: reservationData.endDate,
            license_number: reservationData.licenseNumber
        };

        try {
            const res = await fetch(`${backendUrl}/my-reservation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(bookingPayload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || "Error al crear la reserva");
            }

            const data = await res.json();
            const reservationId = data.new_booking.id;

            navigate(`/thanks/${reservationId}`);

        } catch (err) {
            console.error("Error:", err);
            alert(err.message || "Error al confirmar la reserva.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="row g-3 d-flex justify-content-center align-items-center my-4">
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
                <button type="submit" className="btn btn-primary">Confirm</button>
            </div>
        </form>
    );
};