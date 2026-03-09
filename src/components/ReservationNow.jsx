import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// Import des actions exactes de tes Slices
import { connecter } from "../features/auth/authSlice";
import { updateCar } from "../features/cars/carsSlice"; // Note: ton slice s'appelle "car" au singulier dans le name
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

  useEffect(() => {
    if (formData.startDate && formData.endDate && car) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setTotalPrice(diff > 0 ? diff * car.pricePerDay : car.pricePerDay);
    }
  }, [formData.startDate, formData.endDate, car]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    let finalUser = user;

    // 1. CRÉATION DU COMPTE SI NOUVEAU CLIENT
    if (!user) {
      finalUser = {
        id: Date.now(), // ID temporaire unique
        name: formData.nomComplet,
        email: formData.email,
        password: formData.password,
        role: "client",
        avatar: "https://via.placeholder.com/150"
      };

      // Ajouter à la liste globale des utilisateurs
      dispatch(addUser(finalUser));
      // Connecter l'utilisateur (Met à jour le state.auth et le localStorage)
      dispatch(connecter(finalUser));
    }

    // 2. CHANGER LE STATUT DE LA VOITURE (Action: updateCar)
    dispatch(updateCar({ id: car.id, status: "booked" }));

    // 3. AJOUTER LA RÉSERVATION (Action: addReservation)
    // Ton reducer addReservation gère déjà l'ID automatique et le status "pending"
    dispatch(addReservation({
      carId: car.id,
      clientId: finalUser.id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalPrice: totalPrice
    }));

    alert("Réservation confirmée ! Vous allez être redirigé vers votre espace.");
    
    // 4. REDIRECTION VERS DASHBOARD CLIENT
    navigate("/dashboard/client");
  };

  if (!car) return <div className="text-center p-5">Voiture introuvable...</div>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 shadow p-4 rounded bg-white">
          <h2 className="text-center mb-4 fw-bold text-primary">Finaliser la réservation</h2>
          
          <div className="alert alert-secondary d-flex justify-content-between">
            <span>Véhicule : <strong>{car.name}</strong></span>
            <span>Prix : <strong>{totalPrice} MAD</strong></span>
          </div>

          <form onSubmit={handleBookingSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nom Complet</label>
                <input type="text" className="form-control" value={formData.nomComplet} required
                       disabled={!!user} onChange={(e) => setFormData({...formData, nomComplet: e.target.value})} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={formData.email} required
                       disabled={!!user} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              {!user && (
                <div className="col-12 mb-3">
                  <label className="form-label text-danger fw-bold">Choisir un mot de passe</label>
                  <input type="password" placeholder="Pour vos prochaines connexions" className="form-control border-danger" required
                         onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
              )}

              <div className="col-md-6 mb-3">
                <label className="form-label">Date Début</label>
                <input type="date" className="form-control" required 
                       onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Date Fin</label>
                <input type="date" className="form-control" required 
                       onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 mt-4 shadow-sm">
              {user ? "Confirmer la réservation" : "Créer mon compte et Réserver"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationNow;