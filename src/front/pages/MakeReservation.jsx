import { use } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useParams, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function MakeReservation() {
    const {store, dispatch} = useGlobalReducer()
    const navigate = useNavigate()
    
    
    return (
        <form className="row g-3 d-flex justify-content-center align-items-center my-4">
            <div className="col-md-9">
                <label for="inputEmail4" className="form-label">Car Model</label>
                <input type="email" className="form-control" id="inputEmail4" />
            </div>
            <div className="col-md-3">
                <label for="inputPassword4" className="form-label">License Plate</label>
                <input type="password" className="form-control" id="inputPassword4" />
            </div>
            <div className="col-md-6">
                <label for="inputEmail4" className="form-label">Start Day</label>
                <input type="email" className="form-control" id="inputEmail4" />
            </div>
            <div className="col-md-6">
                <label for="inputPassword4" className="form-label">End Day</label>
                <input type="password" className="form-control" id="inputPassword4" />
            </div>
            <div className="col-md-6">
                <label for="inputCity" className="form-label">License Number</label>
                <input type="text" className="form-control" id="inputCity" />
            </div>
            <div className="col-md-3">
                <label for="inputState" className="form-label">Reservation Number</label>
                <input type="text" className="form-control" id="inputZip" />
            </div>
            <div className="col-md-3">
                <label for="inputZip" className="form-label">Pricing</label>
                <input type="text" className="form-control" id="inputZip" />
            </div>
            <div className="col-12 mb-2 d-flex justify-content-center">
                <button type="submit" className="btn btn-primary">Confirm</button>
            </div>
        </form>
    );
};