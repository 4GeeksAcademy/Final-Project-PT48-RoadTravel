import React, { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import CardSubcompactCar from "../components/CardSubcompactCar.jsx";
import CardMediumCar from "../components/CardMediumCar.jsx";
import CardPremiumCar from "../components/CardPremiumCar.jsx";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Home() {
  const navigate = useNavigate()




  // validaciones

  return (
    
    
    <div>
      <Navbar />
      <div className="jumbotron">
        <div className="container">
          <h1 className="display-4 title-jumbotrone">Welcome to RoadTravel!</h1>
          <p className="lead">Take control of your journey</p>
          <hr className="my-4" />
          <button onClick={() => navigate("/signup")} className="btn signup btn-lg" href="#" role="button">Let's start</button>

        </div>

      </div>

      <div className="container my-4">
        <h2 className="text-center my-4">Our Different Ranges</h2>
        <div className="row d-flex justify-content-between container px-4">
          <div className="col-md-4 card" style={{width: '340px'}}>
            <img src="https://www.buyatoyota.com/sharpr/bat/assets/img/vehicle-info/corollahatchback/2025/hero-image.png" className="card-img-top imgsize" alt="..."/>
              <div className="card-body">
                <h3 className="text-center">SubCompact</h3>
              </div>
          </div>

          <div className="col-md-4 card" style={{width: '340px'}}>
            <img src="https://acroadtrip.blob.core.windows.net/catalogo-imagenes/l/RT_V_b79a2941f9cb4c828f58cfd716b087fc.jpg" className="card-img-top imgsize" alt="..."/>
              <div className="card-body">
                <h3 className="text-center">Medium</h3>
              </div>
          </div>

          <div className="col-md-4 card" style={{width: '340px', height: '245'}}>
            <img src="https://dodomat.com.my/cdn/shop/files/car-mat-McLaren720s-2018-present.png?v=1724999916" className="card-img-top imgsize" alt="..."/>
              <div className="card-body">
                <h3 className="text-center">Premium</h3>
              </div>
          </div>
        </div>
      </div>

      <div>

      </div>
    </div>


  );
}

