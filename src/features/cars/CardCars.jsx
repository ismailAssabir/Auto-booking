import { Link } from "react-router-dom";

export default function CardCars({car}){
    return (
    <div className="card h-100 shadow-sm">
      <img 
        src={car.image} 
        className="card-img-top" 
        alt={car.name} 
        style={{ height: '200px', objectFit: 'cover' }} 
      />
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <h5 className="card-title">{car.name}</h5>
          <span className="badge bg-success">{car.category}</span>
        </div>
        <p className="card-text text-muted mb-2">
          📍 {car.location} | ⛽ {car.fuel}
        </p>
        <h6 className="text-primary fw-bold">{car.pricePerDay} DH / jour</h6>
      </div>
      <div className="card-footer bg-white border-top-0">
        <Link to={`/login`} className="btn btn-primary w-100"> Réservez maintenant</Link>
      </div>
    </div>
  );
}