import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addReservation } from "../features/reservation/reservationSlice";
import { updateCar } from "../features/cars/carsSlice";
const ReservationVoiture = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const car = useSelector((state) => state.cars.cars.find((c) => c.id === parseInt(id)));
  const user = useSelector((state) => state.auth.user);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    if (!car) navigate("/dashboard/client");
  }, [user, car, navigate]);

  useEffect(() => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end > start) {
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalPrice(diffDays * car.pricePerDay);
    } else {
      setTotalPrice(0); 
    }
  }
}, [startDate, endDate, car]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    dispatch(addReservation({
        carId: Number(id),
        userId: user.id,
        startDate: startDate,
        endDate: endDate,
        totalPrice: totalPrice
    }));
    dispatch(updateCar({ id: Number(id), status: "reserved" }));
    setTimeout(() => {
        alert("Réservation effectuée avec succès !");
        navigate("/dashboard/client");
    }, 1000);
  };

  if (!car) return null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <Link to="/dashboard/client" className="btn btn-outline-secondary mb-4 rounded-pill">
            <i className="fas fa-arrow-left me-2"></i> Retour
          </Link>

          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="row g-0">
              <div className="col-md-6">
                <img src={car.image} alt={car.name} className="img-fluid h-100" style={{ objectFit: "cover", minHeight: "350px" }} />
              </div>

              <div className="col-md-6 p-4 p-lg-5 bg-white">
                <h2 className="fw-bold">{car.name}</h2>
                <p className="text-muted">Finalisez votre réservation pour ce véhicule.</p>

                <div className="mb-4">
                   <span className="badge bg-info text-dark me-2">{car.transmission}</span>
                   <span className="badge bg-secondary">{car.seats} Places</span>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Date de début</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        required 
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setStartDate(e.target.value)} 
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Date de fin</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        required 
                        min={startDate || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setEndDate(e.target.value)} 
                    />
                  </div>

                  <div className="p-3 bg-light rounded-3 mb-4 d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Total :</span>
                    <span className="fs-4 fw-bold text-primary">{totalPrice} MAD</span>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow"
                    disabled={isSubmitting || !startDate || !endDate}
                  >
                    {isSubmitting ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span> Traitement...</>
                    ) : (
                        "Confirmer la réservation"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationVoiture;