import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { NavbarForUsers } from '../components/NavbarForUsers';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function MyReservations() {
    const { store } = useGlobalReducer();
    const [reservations, setReservations] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editDates, setEditDates] = useState({ start_day: "", end_day: "" });

    const token = localStorage.getItem("token");

    const fetchReservations = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/my-reservations`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg);
            setReservations(data);
        } catch (err) {
            console.error("Error loading reservations:", err.message);
        }
    };

    const deleteReservation = async (id) => {
        if (!window.confirm("Are you sure you want to delete this reservation?")) return;
        try {
            const res = await fetch(`${backendUrl}/api/my-reservation/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to delete reservation");
            
            setReservations(reservations.filter(item => item.id != id));
        } catch (err) {
            console.error("Delete error:", err.message);
        }
    };

    const updateReservation = async (id) => {
        try {
            const res = await fetch(`${backendUrl}/api/my-reservation/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editDates)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg);
            setEditId(null);
            setEditDates({ start_day: "", end_day: "" });
            fetchReservations();
        } catch (err) {
            alert(err.message);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    return (
        <div>
        <NavbarForUsers index="privatehome" booking="my-reservations" />
        <div className="container my-5 signup-form">
            <h2 className="mb-4">My Reservations</h2>
            {reservations.length === 0 ? (
                <p>You have no reservations.</p>
            ) : (
                <div className="list-group">
                    {reservations.map(res => (
                        <div key={res.id} className="list-group-item mb-3">
                            <h5>{res.car_model} - {res.car_id}</h5>
                            <p><strong>From:</strong> {res.start_day} <strong>To:</strong> {res.end_day}</p>
                            <p><strong>Price:</strong> ${res.amount}</p>
                            <div className="d-flex gap-2">
                                <button className="btn btn-danger btn-sm" onClick={() => deleteReservation(res.id)}>
                                    Delete
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => {
                                    setEditId(res.id);
                                    setEditDates({ start_day: res.start_day, end_day: res.end_day });
                                }}>
                                    Edit
                                </button>
                            </div>
                            {editId === res.id && (
                                <div className="mt-3">
                                    <div className="row g-2">
                                        <div className="col-md-5">
                                            <label>Start Date</label>
                                            <input type="date" className="form-control"
                                                value={editDates.start_day}
                                                onChange={(e) => setEditDates({ ...editDates, start_day: e.target.value })} />
                                        </div>
                                        <div className="col-md-5">
                                            <label>End Date</label>
                                            <input type="date" className="form-control"
                                                value={editDates.end_day}
                                                onChange={(e) => setEditDates({ ...editDates, end_day: e.target.value })} />
                                        </div>
                                        <div className="col-md-2 d-flex align-items-end">
                                            <button className="btn btn-success w-100" onClick={() => updateReservation(res.id)}>Save</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
        </div>
    );
}
