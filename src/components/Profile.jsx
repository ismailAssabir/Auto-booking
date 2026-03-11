import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../features/user/userSlice";

export default function Profil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const users = useSelector(state => state.users?.users) || [];
  const reservations = useSelector(state => state.reservations?.reservations) || [];
  const cars = useSelector(state => state.cars?.cars) || [];
  const currentUser = useSelector(state => state.auth?.user);
  
  const userId = Number(id);
  const user = users.find((u) => u.id === userId);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    if (currentUser.role !== 'admin' && currentUser.id !== userId) {
      navigate(`/profil/${currentUser.id}`);
    }

    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        role: user.role || 'client'
      });
    }
  }, [currentUser, navigate, userId, user]);

  const userReservations = reservations.filter((res) => res.userId === userId);

  const activeReservations = userReservations.filter(r => {
    const car = cars.find(c => c.id === r.carId);
    return car?.status === "reserved" || car?.status === "confirmed";
  }).length;

  const completedReservations = userReservations.filter(r => {
    const car = cars.find(c => c.id === r.carId);
    return car?.status === "available" || car?.status === "completed";
  }).length;

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, image: "L'image ne doit pas dépasser 5MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    const phoneDigits = editedUser.phone?.replace(/\D/g, '') || '';
    
    if (phoneDigits.length !== 10 && phoneDigits.length > 0) {
      errors.phone = "Le numéro doit contenir 10 chiffres";
    }
    
    if (editedUser.password && editedUser.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const updatedUser = {
      ...user,
      name: editedUser.name,
      email: editedUser.email,
      phone: editedUser.phone,
      ...(editedUser.password && { password: editedUser.password }),
      ...(previewImage && { avatar: previewImage })
    };

    dispatch(updateUser(updatedUser));
    setIsEditing(false);
    setPreviewImage(null);
    setEditedUser(prev => ({ ...prev, password: '' }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewImage(null);
    setEditedUser({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'client'
    });
    setFormErrors({});
  };

  if (!user) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          <h4>Utilisateur introuvable</h4>
          <button onClick={() => navigate(-1)} className="btn btn-primary mt-3">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const canEdit = currentUser?.role === 'admin' || currentUser?.id === userId;

  return (
    <div className="container py-5">
      {/* CARTE PROFIL */}
      <div className="card border-0 shadow-lg rounded-4 mb-5 overflow-hidden">
        <div className="bg-primary text-white p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex align-items-center flex-wrap">
              {/* Avatar avec option d'édition */}
              <div className="position-relative me-4">
                <img
                  src={previewImage || user.avatar || 'https://via.placeholder.com/120'}
                  alt={user.name}
                  className="rounded-circle border border-4 border-white shadow"
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                />
                {isEditing && (
                  <label className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 border border-2 border-white"
                         style={{ cursor: 'pointer' }}>
                    <i className="fas fa-camera text-white"></i>
                    <input type="file" className="d-none" accept="image/*" onChange={handleImageChange} />✏️
                  </label>
                )}
              </div>

              {/* Informations utilisateur */}
              <div className="flex-grow-1">
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={editedUser.name}
                      onChange={handleInputChange}
                      className="form-control bg-white bg-opacity-25 text-white border-0 mb-2"
                      placeholder="Nom"
                    />
                    <div className="d-flex gap-2 mb-2">
                      <i className="fas fa-envelope mt-2"></i>
                      <input
                        type="email"
                        name="email"
                        value={editedUser.email}
                        onChange={handleInputChange}
                        className="form-control bg-white bg-opacity-25 text-white border-0"
                        placeholder="Email"
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <i className="fas fa-phone mt-2"></i>
                      <input
                        type="tel"
                        name="phone"
                        value={editedUser.phone}
                        onChange={handleInputChange}
                        className="form-control bg-white bg-opacity-25 text-white border-0"
                        placeholder="Téléphone"
                      />
                    </div>
                    {formErrors.phone && (
                      <small className="text-warning">{formErrors.phone}</small>
                    )}
                  </div>
                ) : (
                  <>
                    <h2 className="fw-bold mb-1">{user.name}</h2>
                    <p className="mb-1">
                      <i className="fas fa-envelope me-2"></i>
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="mb-1">
                        <i className="fas fa-phone me-2"></i>
                        {user.phone}
                      </p>
                    )}
                  </>
                )}
                
                {/* Badge rôle */}
                <span className={`badge px-3 py-2 mt-2 ${
                  user.role === 'admin' ? 'bg-danger' : 
                  user.role === 'employee' || user.role === 'employe' ? 'bg-warning text-dark' : 'bg-info'
                }`}>
                  {user.role === 'employee' || user.role === 'employe' ? 'Employé' : 
                   user.role === 'admin' ? 'Administrateur' : 'Client'}
                </span>
              </div>
            </div>

            {/* Boutons d'action */}
            {canEdit && (
              <div>
                {isEditing ? (
                  <div className="d-flex gap-2">
                    <button onClick={handleSave} className="btn btn-success rounded-pill px-3">
                      <i className="fas fa-check me-2"></i>Enregistrer
                    </button>
                    <button onClick={handleCancel} className="btn btn-light rounded-pill px-3">
                      <i className="fas fa-times me-2"></i>Annuler
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn btn-light rounded-pill px-3">
                    <i className="fas fa-edit me-2"></i>Modifier profil
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Champ mot de passe en mode édition */}
          {isEditing && (
            <div className="mt-3">
              <div className="row">
                <div className="col-md-6">
                  <label className="text-white small">Nouveau mot de passe (optionnel)</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={editedUser.password}
                      onChange={handleInputChange}
                      className="form-control bg-white bg-opacity-25 text-white border-0"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-light"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {formErrors.password && (
                    <small className="text-warning">{formErrors.password}</small>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STATISTIQUES */}
        <div className="row text-center p-4 bg-light g-3">
          <div className="col-md-4">
            <div className="p-3">
              <h4 className="fw-bold text-primary">{userReservations.length}</h4>
              <small className="text-muted text-uppercase fw-bold">Total Réservations</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3">
              <h4 className="fw-bold text-success">{activeReservations}</h4>
              <small className="text-muted text-uppercase fw-bold">Réservations Actives</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3">
              <h4 className="fw-bold text-danger">{completedReservations}</h4>
              <small className="text-muted text-uppercase fw-bold">Réservations Terminées</small>
            </div>
          </div>
        </div>
      </div>

      {/* RÉSERVATIONS (inchangé) */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Mes Réservations 🚗</h3>
        {currentUser?.role === 'admin' && currentUser.id !== userId && (
          <span className="badge bg-secondary">Consultation admin</span>
        )}
      </div>

      {userReservations.length === 0 ? (
        <div className="alert alert-info rounded-4 shadow-sm text-center p-5">
          <i className="fas fa-calendar-times fa-3x mb-3"></i>
          <h5>Aucune réservation pour le moment</h5>
          {currentUser?.id === userId && (
            <Link to="/" className="btn btn-primary mt-3">
              Réserver une voiture
            </Link>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {userReservations.map((res) => {
            const car = cars.find((c) => c.id === res.carId);
            
            return (
              <div key={res.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                  <div className="position-relative">
                    <img
                      src={car?.image || 'https://via.placeholder.com/300x200'}
                      alt={car?.name || 'Voiture'}
                      className="card-img-top"
                      style={{ height: "180px", objectFit: "cover" }}
                    />
                    <span className={`position-absolute top-0 end-0 m-3 badge ${
                      res.status === 'confirmed' ? 'bg-success' :
                      res.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                    }`}>
                      {res.status === 'confirmed' ? 'Confirmée' :
                       res.status === 'pending' ? 'En attente' : 'Terminée'}
                    </span>
                  </div>

                  <div className="card-body">
                    <h5 className="fw-bold mb-2">{car?.name || 'Véhicule non spécifié'}</h5>
                    
                    {car && (
                      <p className="text-muted small mb-2">
                        <i className="fas fa-cog me-1"></i> {car.transmission || 'Manuelle'} | 
                        <i className="fas fa-chair ms-2 me-1"></i> {car.seats || 4} places
                      </p>
                    )}

                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-1">
                        <i className="fas fa-calendar-alt text-primary me-2"></i>
                        <small>Du: {formatDate(res.startDate)}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-calendar-check text-success me-2"></i>
                        <small>Au: {formatDate(res.endDate || res.startDate)}</small>
                      </div>
                    </div>

                    {car && (
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-primary">
                          {car.pricePerDay} MAD <small className="text-muted fw-normal">/jour</small>
                        </span>
                        <span className={`badge ${
                          car.status === 'available' ? 'bg-success' :
                          car.status === 'reserved' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {car.status === 'available' ? 'Disponible' :
                           car.status === 'reserved' ? 'Réservé' : 'Maintenance'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOUTON RETOUR */}
      <div className="text-center mt-5">
        <button
          onClick={() => navigate(
            currentUser?.role === 'admin' && currentUser.id !== userId 
              ? '/dashboard/chef' 
              : -1
          )}
          className="btn btn-outline-primary px-5 py-2 rounded-pill fw-bold"
        >
          <i className="fas fa-arrow-left me-2"></i>
          Retour
        </button>
      </div>
    </div>
  );
}