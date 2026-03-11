import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// Import des actions exactes de tes Slices
import { connecter } from "../features/auth/authSlice";
import { updateCar } from "../features/cars/carsSlice";
import { addReservation } from "../features/reservation/reservationSlice";
import { addUser } from "../features/user/userSlice";

const ReservationNow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const car = useSelector((state) => state.cars.cars.find((c) => String(c.id) === String(id)));

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    nomComplet: user ? user.name : "",
    email: user ? user.email : "",
    password: "",
    telephone: "",
    permis: ""
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durationError, setDurationError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Calcul de la durée et du prix total
  useEffect(() => {
    if (formData.startDate && formData.endDate && car) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      // Vérifier que les dates sont valides
      if (start && end && end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDuration(diffDays);
        
        // Vérifier la durée minimale
        if (diffDays < 3) {
          setDurationError("La durée minimale de réservation est de 3 jours");
          setTotalPrice(0);
        } else {
          setDurationError("");
          setTotalPrice(diffDays * car.pricePerDay);
        }
      } else {
        setDuration(0);
        setTotalPrice(0);
        if (end <= start) {
          setDurationError("La date de fin doit être postérieure à la date de début");
        }
      }
    }
  }, [formData.startDate, formData.endDate, car]);

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    // Validation des dates
    if (!formData.startDate) {
      errors.startDate = "La date de début est requise";
    }
    if (!formData.endDate) {
      errors.endDate = "La date de fin est requise";
    }
    if (duration < 3) {
      errors.duration = "La durée minimale de réservation est de 3 jours";
    }

    // Validation des champs utilisateur si non connecté
    if (!user) {
      if (!formData.nomComplet) errors.nomComplet = "Le nom complet est requis";
      if (!formData.email) errors.email = "L'email est requis";
      if (!formData.password) errors.password = "Le mot de passe est requis";
      if (formData.password && formData.password.length < 6) {
        errors.password = "Le mot de passe doit contenir au moins 6 caractères";
      }
      if (!formData.telephone) {
        errors.telephone = "Le numéro de téléphone est requis";
      } else {
        const phoneDigits = formData.telephone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
          errors.telephone = "Le numéro doit contenir 10 chiffres";
        }
      }
      if (!formData.permis) {
        errors.permis = "Le numéro de permis est requis";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Formatage automatique du téléphone
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 7) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({...formData, telephone: formatted});
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    // Validation du formulaire
    if (!validateForm()) {
      // Faire défiler jusqu'à la première erreur
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Vérification supplémentaire de la durée
    if (duration < 3) {
      setDurationError("La durée minimale de réservation est de 3 jours");
      return;
    }

    let finalUser = user;

    // 1. CRÉATION DU COMPTE SI NOUVEAU CLIENT
    if (!user) {
      finalUser = {
        id: Date.now(), // ID temporaire unique
        name: formData.nomComplet,
        email: formData.email,
        password: formData.password,
        phone: formData.telephone,
        permis: formData.permis,
        role: "client",
        avatar: "https://via.placeholder.com/150"
      };

      // Ajouter à la liste globale des utilisateurs
      dispatch(addUser(finalUser));
      // Connecter l'utilisateur
      dispatch(connecter(finalUser));
    }

    // 2. CHANGER LE STATUT DE LA VOITURE
    dispatch(updateCar({ id: car.id, status: "booked" }));

    // 3. AJOUTER LA RÉSERVATION
    dispatch(addReservation({
      carId: car.id,
      clientId: finalUser.id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: duration,
      totalPrice: totalPrice,
      status: "confirmed"
    }));

    alert(`✅ Réservation confirmée pour ${duration} jours ! Vous allez être redirigé vers votre espace.`);
    
    // 4. REDIRECTION VERS DASHBOARD CLIENT
    navigate("/dashboard/client");
  };

  // Obtenir la date du jour pour min dans les inputs date
  const today = new Date().toISOString().split('T')[0];
  
  // Calculer la date minimale de fin (startDate + 3 jours)
  const getMinEndDate = () => {
    if (formData.startDate) {
      const start = new Date(formData.startDate);
      start.setDate(start.getDate() + 3);
      return start.toISOString().split('T')[0];
    }
    return '';
  };

  if (!car) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center p-5 rounded-4 shadow">
          <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
          <h4>Voiture introuvable</h4>
          <p>Le véhicule que vous recherchez n'existe pas ou a été supprimé.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary mt-3 rounded-pill px-4">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* En-tête avec image de la voiture */}
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
            <div className="row g-0">
              <div className="col-md-5">
                <img 
                  src={car.image || 'https://via.placeholder.com/600x400'} 
                  className="img-fluid h-100 w-100" 
                  alt={car.name}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="col-md-7 p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="fw-bold mb-1">{car.name}</h2>
                    <p className="text-muted mb-0">
                      <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                      {car.location || 'Casablanca'}
                    </p>
                  </div>
                  <span className={`badge px-3 py-2 ${car.status === 'available' ? 'bg-success' : 'bg-danger'}`}>
                    {car.status === 'available' ? 'Disponible' : 'Non disponible'}
                  </span>
                </div>

                <div className="d-flex gap-3 mb-3">
                  <span className="badge bg-light text-dark rounded-pill">
                    <i className="fas fa-users me-1"></i> {car.seats} places
                  </span>
                  <span className="badge bg-light text-dark rounded-pill">
                    <i className="fas fa-cog me-1"></i> {car.transmission}
                  </span>
                  <span className="badge bg-light text-dark rounded-pill">
                    <i className="fas fa-gas-pump me-1"></i> {car.fuel || 'Essence'}
                  </span>
                </div>

                <div className="mb-3">
                  <h3 className="text-primary fw-bold">
                    {car.pricePerDay} MAD <small className="text-muted fs-6">/jour</small>
                  </h3>
                </div>

                {duration > 0 && (
                  <div className="bg-light rounded-3 p-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Durée de location:</span>
                      <span className="fw-bold">{duration} jours</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Prix total:</span>
                      <span className="fw-bold text-primary fs-5">{totalPrice} MAD</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulaire de réservation */}
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-header bg-white border-0 p-4">
              <h4 className="fw-bold mb-0">
                <i className="fas fa-calendar-check text-primary me-2"></i>
                Finaliser la réservation
              </h4>
              <p className="text-muted small mb-0 mt-1">
                <i className="fas fa-info-circle me-1"></i>
                La durée minimale de location est de 3 jours
              </p>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleBookingSubmit}>
                {/* Section dates */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-calendar-alt text-primary me-2"></i>
                      Date de début
                    </label>
                    <input 
                      type="date" 
                      className={`form-control form-control-lg rounded-3 ${formErrors.startDate ? 'is-invalid' : ''}`}
                      min={today}
                      required 
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                    {formErrors.startDate && (
                      <div className="invalid-feedback">{formErrors.startDate}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-calendar-alt text-primary me-2"></i>
                      Date de fin
                    </label>
                    <input 
                      type="date" 
                      className={`form-control form-control-lg rounded-3 ${formErrors.endDate || durationError ? 'is-invalid' : ''}`}
                      min={getMinEndDate()}
                      disabled={!formData.startDate}
                      required 
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                    {(formErrors.endDate || durationError) && (
                      <div className="invalid-feedback">{formErrors.endDate || durationError}</div>
                    )}
                  </div>
                </div>

                {/* Message d'erreur durée */}
                {durationError && duration > 0 && duration < 3 && (
                  <div className="alert alert-warning d-flex align-items-center mb-4">
                    <i className="fas fa-exclamation-triangle me-3 fs-4"></i>
                    <div>
                      <strong>Durée insuffisante</strong>
                      <p className="mb-0">La location doit être d'au moins 3 jours. Vous avez sélectionné {duration} jour(s).</p>
                    </div>
                  </div>
                )}


                {/* Résumé et validation */}
                <div className="bg-light rounded-3 p-4 mb-4">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h6 className="fw-bold mb-2">Récapitulatif</h6>
                      <div className="d-flex flex-wrap gap-4">
                        <div>
                          <small className="text-muted d-block">Véhicule</small>
                          <span className="fw-bold">{car.name}</span>
                        </div>
                        <div>
                          <small className="text-muted d-block">Durée</small>
                          <span className="fw-bold">{duration > 0 ? duration : '-'} jours</span>
                        </div>
                        <div>
                          <small className="text-muted d-block">Prix total</small>
                          <span className="fw-bold text-primary">{totalPrice > 0 ? totalPrice : '-'} MAD</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 text-md-end">
                      <span className="badge bg-warning text-dark px-3 py-2">
                        <i className="fas fa-clock me-1"></i>
                        Minimum 3 jours
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-3 shadow"
                  disabled={duration < 3}
                >
                  <i className="fas fa-check-circle me-2"></i>
                  {user ? "Confirmer la réservation" : "Créer mon compte et réserver"}
                </button>

                {duration < 3 && duration > 0 && (
                  <p className="text-danger text-center mt-3 mb-0">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    La durée de location doit être d'au moins 3 jours
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationNow;