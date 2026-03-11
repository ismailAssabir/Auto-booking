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
  const [duration, setDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [durationError, setDurationError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const MINIMUM_DAYS = 3;

  useEffect(() => {
    if (!user) navigate("/login");
    if (!car) navigate("/dashboard/client");
  }, [user, car, navigate]);

  // Calcul de la durée et validation
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end > start) {
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDuration(diffDays);
        
        // Vérifier la durée minimale
        if (diffDays < MINIMUM_DAYS) {
          setDurationError(`La durée minimale de réservation est de ${MINIMUM_DAYS} jours (vous avez sélectionné ${diffDays} jour${diffDays > 1 ? 's' : ''})`);
          setTotalPrice(0);
        } else {
          setDurationError("");
          setTotalPrice(diffDays * car.pricePerDay);
        }
      } else {
        setDuration(0);
        setTotalPrice(0);
        setDurationError("La date de fin doit être postérieure à la date de début");
      }
    }
  }, [startDate, endDate, car]);

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!startDate) {
      errors.startDate = "La date de début est requise";
    }
    if (!endDate) {
      errors.endDate = "La date de fin est requise";
    }
    if (duration < MINIMUM_DAYS) {
      errors.duration = `La durée minimale est de ${MINIMUM_DAYS} jours`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!validateForm()) {
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Vérification supplémentaire
    if (duration < MINIMUM_DAYS) {
      setDurationError(`La durée minimale de réservation est de ${MINIMUM_DAYS} jours`);
      return;
    }

    setIsSubmitting(true);

    // Ajout de la réservation
    dispatch(addReservation({
      carId: Number(id),
      userId: user.id,
      startDate: startDate,
      endDate: endDate,
      duration: duration,
      totalPrice: totalPrice,
      status: "confirmed"
    }));

    // Mise à jour du statut de la voiture
    dispatch(updateCar({ id: Number(id), status: "reserved" }));

    setTimeout(() => {
      alert(`✅ Réservation confirmée pour ${duration} jours !`);
      navigate("/dashboard/client");
    }, 1000);
  };

  // Obtenir la date du jour pour min dans les inputs date
  const today = new Date().toISOString().split('T')[0];
  
  // Calculer la date minimale de fin (startDate + 3 jours)
  const getMinEndDate = () => {
    if (startDate) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + MINIMUM_DAYS);
      return start.toISOString().split('T')[0];
    }
    return today;
  };

  if (!car) return null;

  return (
    <div className="container py-5">
      {/* Styles personnalisés */}
      <style jsx>{`
        .car-image {
          transition: transform 0.3s ease;
        }
        .car-image:hover {
          transform: scale(1.02);
        }
      `}</style>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <Link to="/dashboard/client" className="btn btn-outline-secondary mb-4 rounded-pill px-4 py-2">
            <i className="fas fa-arrow-left me-2"></i> Retour au tableau de bord
          </Link>

          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="row g-0">
              {/* Image de la voiture */}
              <div className="col-md-6 position-relative overflow-hidden">
                <img 
                  src={car.image || 'https://via.placeholder.com/600x400'} 
                  alt={car.name} 
                  className="img-fluid h-100 w-100 car-image" 
                  style={{ objectFit: "cover", minHeight: "400px" }} 
                />
                <div className="position-absolute top-0 start-0 m-3">
                  <span className={`badge px-3 py-2 ${car.status === 'available' ? 'bg-success' : 'bg-danger'}`}>
                    {car.status === 'available' ? '● Disponible' : '● Réservé'}
                  </span>
                </div>
              </div>

              {/* Formulaire de réservation */}
              <div className="col-md-6 p-4 p-lg-5 bg-white">
                <div className="mb-4">
                  <h2 className="fw-bold mb-2">{car.name}</h2>
                  <p className="text-muted mb-3">
                    <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                    {car.location || 'Casablanca'}
                  </p>
                  
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                      <i className="fas fa-cog me-1"></i> {car.transmission}
                    </span>
                    <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                      <i className="fas fa-users me-1"></i> {car.seats} Places
                    </span>
                    <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                      <i className="fas fa-gas-pump me-1"></i> {car.fuel || 'Essence'}
                    </span>
                  </div>

                  <div className="bg-primary bg-opacity-10 rounded-3 p-3 mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Prix par jour</span>
                      <span className="fs-4 fw-bold text-primary">{car.pricePerDay} MAD</span>
                    </div>
                    <p className="text-muted small mb-0 mt-2">
                      <i className="fas fa-info-circle me-1"></i>
                      Location minimum de {MINIMUM_DAYS} jours
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Dates */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-calendar-alt text-primary me-2"></i>
                      Date de début
                    </label>
                    <input 
                      type="date" 
                      className={`form-control form-control-lg rounded-3 ${formErrors.startDate ? 'is-invalid' : ''}`}
                      required 
                      min={today}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setEndDate(""); // Reset end date when start date changes
                      }}
                    />
                    {formErrors.startDate && (
                      <div className="invalid-feedback">{formErrors.startDate}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="fas fa-calendar-alt text-primary me-2"></i>
                      Date de fin
                    </label>
                    <input 
                      type="date" 
                      className={`form-control form-control-lg rounded-3 ${formErrors.endDate || durationError ? 'is-invalid' : ''}`}
                      required 
                      min={getMinEndDate()}
                      disabled={!startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    {(formErrors.endDate || durationError) && (
                      <div className="invalid-feedback">{formErrors.endDate || durationError}</div>
                    )}
                    {startDate && !endDate && (
                      <small className="text-muted mt-1 d-block">
                        <i className="fas fa-arrow-up me-1"></i>
                        La date de fin minimum est le {new Date(getMinEndDate()).toLocaleDateString('fr-FR')}
                      </small>
                    )}
                  </div>

                  {/* Message d'erreur durée */}
                  {durationError && duration > 0 && duration < MINIMUM_DAYS && (
                    <div className="alert alert-warning d-flex align-items-center mb-4">
                      <i className="fas fa-exclamation-triangle me-3 fs-4"></i>
                      <div>
                        <strong>Durée insuffisante</strong>
                        <p className="mb-0">{durationError}</p>
                      </div>
                    </div>
                  )}

                  {/* Résumé de la réservation */}
                  {duration >= MINIMUM_DAYS && totalPrice > 0 && (
                    <div className="bg-light rounded-3 p-4 mb-4">
                      <h6 className="fw-bold mb-3">Récapitulatif</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Durée :</span>
                        <span className="fw-bold">{duration} jours</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Prix par jour :</span>
                        <span>{car.pricePerDay} MAD</span>
                      </div>
                      <div className="d-flex justify-content-between pt-2 border-top">
                        <span className="fw-bold">Total :</span>
                        <span className="fs-4 fw-bold text-primary">{totalPrice} MAD</span>
                      </div>
                    </div>
                  )}

                  {/* Bouton de confirmation */}
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow"
                    disabled={isSubmitting || !startDate || !endDate || duration < MINIMUM_DAYS}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2"></i>
                        Confirmer la réservation
                      </>
                    )}
                  </button>

                  {/* Message de confirmation de durée */}
                  {duration < MINIMUM_DAYS && duration > 0 && (
                    <p className="text-danger text-center mt-3 mb-0">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      La location doit être d'au moins {MINIMUM_DAYS} jours
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                    <i className="fas fa-shield-alt text-primary"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Assurance incluse</h6>
                    <small className="text-muted">Protection complète</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-2">
                    <i className="fas fa-headset text-success"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Support 24/7</h6>
                    <small className="text-muted">Assistance permanente</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                    <i className="fas fa-clock text-warning"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Annulation gratuite</h6>
                    <small className="text-muted">Jusqu'à 24h avant</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationVoiture;