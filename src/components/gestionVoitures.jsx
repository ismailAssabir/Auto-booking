import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeCar, updateCar } from '../features/cars/carsSlice';

const GestionVoitures = () => {
  const dispatch = useDispatch();
  const allCars = useSelector((state) => state.cars.cars) || [];
console.log("yhzghe")
  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      dispatch(removeCar(id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateCar({ id, status: newStatus }));
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">
          <i className="fas fa-car-side me-2 text-primary"></i>
          Gestion du Parc Automobile
        </h2>
        <Link to="/ajouterVoiture" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
          + Ajouter une voiture
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th className="ps-4">Véhicule</th>
                <th>Catégorie / Prix</th>
                <th>État Actuel</th>
                <th className="text-center">Actions sur le statut</th>
                <th className="text-end pe-4">Options</th>
              </tr>
            </thead>
            <tbody>
              {allCars.length > 0 ? (
                allCars.map((car) => (
                  <tr key={car.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <img 
                          src={car.image} 
                          alt={car.name} 
                          className="rounded-3 me-3" 
                          style={{ width: '80px', height: '50px', objectFit: 'cover' }} 
                        />
                        <div>
                          <div className="fw-bold text-dark">{car.name}</div>
                          <div className="text-muted small">ID: #{car.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-primary">{car.pricePerDay} MAD / jour</div>
                      <div className="small text-muted">{car.transmission} | {car.seats} places</div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${
                        car.status === 'available' ? 'bg-success-subtle text-success' : 
                        car.status === 'maintenance' ? 'bg-danger-subtle text-danger' : 
                        'bg-warning-subtle text-warning'
                      }`}>
                        {car.status === 'available' ? '● Disponible' : 
                         car.status === 'maintenance' ? '● Maintenance' : '● Réservée'}
                      </span>
                    </td>
                    <td className="text-center">
                      <select 
                        className="form-select form-select-sm w-auto d-inline-block rounded-pill"
                        value={car.status}
                        onChange={(e) => handleStatusChange(car.id, e.target.value)}
                      >
                        <option value="available">Disponible</option>
                        <option value="reserved">Réservée</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td className="text-end pe-4">
                      <div className="btn-group">
                        <Link to={`/modifierVoiture/${car.id}`} className="btn btn-outline-secondary btn-sm rounded-start">
                          <i className="fas fa-edit">✏️ </i>
                        </Link>
                        <button 
                          onClick={() => handleDelete(car.id)} 
                          className="btn btn-outline-danger btn-sm rounded-end"
                        >
                          <i className="fas fa-trash">🗑️</i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    Aucun véhicule enregistré dans la base de données.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <Link to="/dashboard/chef" className="text-decoration-none text-secondary fw-bold">
          <i className="fas fa-arrow-left me-2"></i> Retour au Dashboard
        </Link>
      </div>
    </div>
  );
};

export default GestionVoitures;