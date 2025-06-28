import React, { useEffect, useState, useCallback } from "react"; // Importar useState y useCallback
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import CardSubcompactCar from "../components/CardSubcompactCar.jsx";
import CardMediumCar from "../components/CardMediumCar.jsx";
import CardPremiumCar from "../components/CardPremiumCar.jsx";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function PrivateHome() {
  const { store, dispatch } = useGlobalReducer();

  // 1. Nuevos estados para las fechas de inicio y fin del filtro
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Función para cargar los coches, ahora parametrizada
  const fetchCars = useCallback(async (category, start = "", end = "") => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Construir la URL con los parámetros de fecha si están presentes
      let url = `${backendUrl}/api/cars?type=${category}`;
      if (start) {
        url += `&start_date=${start}`;
      }
      if (end) {
        url += `&end_date=${end}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'No se pudo parsear el error' }));
        throw new Error(`Error al cargar coches ${category}: ${response.status} ${response.statusText} - ${errorData.msg || 'Mensaje desconocido'}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        dispatch({ type: "set_cars", category: category, payload: data });
      } else {
        console.error(`La API para ${category} no devolvió un array:`, data);
        dispatch({ type: "set_cars", category: category, payload: [] });
      }
    } catch (error) {
      console.error(`Falló la carga de coches ${category}:`, error);
      dispatch({ type: "set_cars", category: category, payload: [] });
    }
  }, [dispatch]); // useCallback para memorizar la función

  // 2. useEffect actualizado para usar la nueva función fetchCars
  useEffect(() => {
    // Carga inicial al montar el componente, sin fechas de filtro
    fetchCars("subcompact");
    fetchCars("medium");
    fetchCars("premium");
  }, [fetchCars]); // Dependencia en fetchCars para que se ejecute al cambiar (por las dependencias internas de fetchCars)

  // 3. Manejador para aplicar los filtros cuando las fechas cambian
  const handleApplyFilters = () => {
    // Cuando el usuario presione el botón de aplicar filtro
    // o cuando las fechas cambien (puedes decidir cuándo se aplica)
    fetchCars("subcompact", startDate, endDate);
    fetchCars("medium", startDate, endDate);
    fetchCars("premium", startDate, endDate);
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4 text-center">Catálogo de Vehículos</h1>

      {/* Sección de Filtros de Fechas */}
      <div className="card p-4 mb-4 shadow-sm">
        <h4 className="mb-3">Filtrar por Disponibilidad de Fechas</h4>
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label htmlFor="startDate" className="form-label">Fecha de Inicio:</label>
            <input 
              type="date" 
              className="form-control" 
              id="startDate" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className="col-md-5">
            <label htmlFor="endDate" className="form-label">Fecha de Fin:</label>
            <input 
              type="date" 
              className="form-control" 
              id="endDate" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100" onClick={handleApplyFilters}>
              Aplicar Filtro
            </button>
          </div>
        </div>
        {/* Opcional: botón para limpiar filtros */}
        {(startDate || endDate) && (
          <div className="mt-3 text-end">
            <button className="btn btn-link btn-sm" onClick={() => { setStartDate(""); setEndDate(""); handleApplyFilters(); }}>
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Secciones de coches por categoría */}
      <h2>Subcompact Cars</h2>
      {store.subcompact.length === 0 ? <p>No cars available in this category for the selected dates.</p> :
        <div className="d-flex flex-wrap">
          {store.subcompact.map(v => <CardSubcompactCar key={v.license_plate} vehicle={v} />)}
        </div>
      }

      <h2>Medium Cars</h2>
      {store.medium.length === 0 ? <p>No cars available in this category for the selected dates.</p> :
        <div className="d-flex flex-wrap">
          {store.medium.map(v => <CardMediumCar key={v.license_plate} vehicle={v} />)}
        </div>
      }

      <h2>Premium Cars</h2>
      {store.premium.length === 0 ? <p>No cars available in this category for the selected dates.</p> :
        <div className="d-flex flex-wrap">
          {store.premium.map(v => <CardPremiumCar key={v.license_plate} vehicle={v} />)}
        </div>
      }
    </div>
  );
}