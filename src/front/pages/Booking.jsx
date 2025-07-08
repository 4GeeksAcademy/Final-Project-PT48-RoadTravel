import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { NavbarForUsers } from '../components/NavbarForUsers';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Booking() {
    const { store } = useGlobalReducer();
    const [reservations, setReservations] = useState([]);
    const [carId, setCarId] = useState(null)
    const [editId, setEditId] = useState(null);
    const [editDates, setEditDates] = useState({ start_day: "", end_day: "" });
    const [price, setPrice] = useState(0)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    const fetchReservations = async () => {
        try {
            const endpoint = store.user?.role === "administrator"
                ? `${backendUrl}/api/admin/reservations`
                : `${backendUrl}/api/my-reservations`;

            const res = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || "Failed to fetch reservations");
            }

            const data = await res.json();
            setReservations(data);
        } catch (err) {
            setError(err.message);
            console.error("Error loading reservations:", err);
        }
        finally {
            setLoading(false);
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

            if (!res.ok) throw new Error("Error deleting reservation");

            setReservations(reservations.filter(item => item.id !== id));
            alert("Reservation successfully deleted");
        } catch (err) {
            alert(err.message);
        }
    };

    const updateReservation = async (id) => {
        try {
            // const date1 = new Date(editDates.start_day);
            // const date2 = new Date(editDates.end_day)
            // const diffTime = Math.abs(date2 - date1);

            // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            // console.log({...editDates, price: price * diffDays});
            // console.log(price);
            

            const res = await fetch(`${backendUrl}/api/my-reservation/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({...editDates, price: price})
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || "Error updating");
            }

            setEditId(null);
            fetchReservations();
            alert("Reservation successfully updated");
        } catch (err) {
            alert(err.message);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [store.user]);

   console.log(reservations);
   

    useEffect(() => {
        // fetchReservations();
        console.log(carId);
        
        let car = null
        if (store.subcompact.length > 0) {
            car = store.subcompact.find(item => item.license_plate == carId);
            if(!car && store.medium.length > 0) {
                car = store.medium.find(item => item.license_plate == carId);
                if(!car && store.premium.length > 0) {
                    car = store.premium.find(item => item.license_plate == carId);
                }
            } 
        }
        console.log(car);
        
        if (car) {

            const startDate = editDates.start_day;
            const endDate = editDates.end_day;
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);
            const diffTime = Math.abs(date2 - date1);

            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            // setReservationData({
            //     model: car.model,
            //     licensePlate: car.license_plate,
            //     startDate: startDate,
            //     endDate: endDate,
            //     licenseNumber: '',
            //     price: car.price * diffDays
            // });
            // console.log(car.amount);
            setPrice(car.price * diffDays)

        }
    }, [store.subcompact, store.premium, store.medium, carId, editDates]);
    
    if (loading) return <div className="container my-5">Loading...</div>;
    if (error) return <div className="container my-5">Error: {error}</div>;

    return (
        <div>
            <NavbarForUsers index="privatehome" booking="bookinglist" />

            <div className="container my-5 booking-vist">
                <h2 className="mb-4">
                    {store.user?.role === "administrator"
                        ? "All Reservations (Admin View)"
                        : "My Reservations"}
                </h2>

                {reservations.length === 0 ? (
                    <p>No reservations found.</p>
                ) : (
                    <div className="list-group">
                        {reservations.map(res => (
                            <div key={res.id} className="list-group-item mb-3">

                                {store.user?.role === "administrator" && (
                                    <div className="mb-2 p-2 bg-light rounded">
                                        <strong>User:</strong> {res.user_name || "N/A"}
                                        <br />
                                        <strong>Email:</strong> {res.user_email || "N/A"}
                                    </div>
                                )}

                                <h5>{res.car_model} - {res.car_id}</h5>
                                <p>
                                    <strong>Date:</strong> {res.start_day} to {res.end_day}
                                    <br />
                                    <strong>Price:</strong> ${res.amount}
                                    <br />
                                    <strong>Reservation ID:</strong> {res.id}
                                    <br />
                                    {res.license_number && <><strong>License Number:</strong> {res.license_number}</>}
                                </p>

                                <div className="d-flex gap-2 mt-2">
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteReservation(res.id)}
                                    >
                                        Delete
                                    </button>

                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => {
                                            setEditId(res.id);
                                            setEditDates({
                                                start_day: res.start_day,
                                                end_day: res.end_day
                                            });
                                            setCarId(res.car_id)
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>

                                {editId === res.id && (
                                    <div className="mt-3 p-3 border rounded">
                                        <h6>Edit dates</h6>
                                        <div className="row g-2">
                                            <div className="col-md-5">
                                                <label className="form-label">Start Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={editDates.start_day}
                                                    onChange={(e) => { setEditDates({
                                                        ...editDates,
                                                        start_day: e.target.value
                                                    })
                                                }}
                                                />
                                            </div>
                                            <div className="col-md-5">
                                                <label className="form-label">End Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={editDates.end_day}
                                                    onChange={(e) => { setEditDates({
                                                        ...editDates,
                                                        end_day: e.target.value
                                                    })
                                                }}
                                                />
                                            </div>
                                            <div className="col-md-2 d-flex align-items-end">
                                                <button
                                                    className="btn booking-button navbar-button-login w-100"
                                                    onClick={() => updateReservation(res.id)}
                                                >
                                                    Save
                                                </button>
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