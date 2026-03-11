import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deconnecter } from "../features/auth/authSlice";

const DashboardClient = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectValue, setSelectValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("cars"); // 'cars' ou 'messages'
  
  const allCars = useSelector((state) => state.cars.cars) || [];
  const user = useSelector((state) => state.auth.user);
  const allContacts = useSelector((state) => state.contacts?.contacts) || [];
  
  // Filtrer les contacts de l'utilisateur connecté
  const userContacts = allContacts.filter(
    contact => contact.userId === user?.id || contact.email === user?.email
  );

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "client") {
      if (user.role === "admin") {
        navigate("/dashboard/chef");
      } else if (user.role === "employee" || user.role === "employe") {
        navigate("/dashboard/personnel");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  // Fonction pour dédoublonner les voitures par nom
  const getUniqueCars = () => {
    const carMap = new Map();
    
    // Parcourir toutes les voitures
    allCars.forEach(car => {
      const carName = car.name;
      
      // Si la voiture n'existe pas encore dans la map, l'ajouter
      if (!carMap.has(carName)) {
        carMap.set(carName, car);
      } else {
        // Si elle existe déjà, vérifier le statut
        const existingCar = carMap.get(carName);
        // Si la voiture existante est disponible et que la nouvelle est réservée, garder la disponible
        // Si la voiture existante est réservée et que la nouvelle est disponible, remplacer par la disponible
        if (existingCar.status !== 'available' && car.status === 'available') {
          carMap.set(carName, car);
        }
        // Si les deux sont réservées, garder la première
        // Si les deux sont disponibles, garder la première (elles sont identiques)
      }
    });
    
    return Array.from(carMap.values());
  };

  const uniqueCars = getUniqueCars();

  const carsSearch = uniqueCars.filter((car) => {
    if (selectValue === "" || selectValue === "name") {
      return car.name.toLowerCase().includes(inputValue.toLowerCase());
    }
    if (selectValue === "price") {
      return car.pricePerDay.toString().includes(inputValue);
    }
    if (selectValue === "disponible") {
      return car.status.toLowerCase().includes(inputValue.toLowerCase());
    }
    return true;
  });

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vous déconnecter ?")) {
      dispatch(deconnecter());
      navigate('/');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Aujourd'hui à " + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Hier à " + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };


  if (!user || user.role !== 'client') return null;

  return (
    <>
      {/* Styles personnalisés */}
      <style jsx>{`
        .car-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          overflow: hidden;
        }
        
        .car-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.15) !important;
        }
        
        .car-card .card-img-top {
          transition: transform 0.5s ease;
        }
        
        .car-card:hover .card-img-top {
          transform: scale(1.05);
        }
        
        .car-card .btn {
          transition: all 0.3s ease;
        }
        
        .car-card:hover .btn:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .car-card .badge {
          transition: all 0.3s ease;
        }
        
        .car-card:hover .badge {
          transform: scale(1.02);
        }

        .message-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .message-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }

        .bg-success-subtle {
          background-color: rgba(25, 135, 84, 0.1);
        }
        
        .bg-info-subtle {
          background-color: rgba(13, 202, 240, 0.1);
        }
        
        .bg-warning-subtle {
          background-color: rgba(255, 193, 7, 0.1);
        }
        
        .bg-danger-subtle {
          background-color: rgba(220, 53, 69, 0.1);
        }
      `}</style>

      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary py-3 mb-4 sticky-top shadow">
        <div className="container">
          <Link className="navbar-brand fw-bold fs-4" to="/">
            <i className="fas fa-car me-2"></i>
            Auto<span className="text-warning">booking</span>
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Tabs de navigation */}
            <div className="d-flex gap-2 ms-4">
              <button 
                className={`btn btn-sm ${activeTab === 'cars' ? 'btn-warning' : 'btn-outline-light'} rounded-pill px-3 fw-semibold`}
                onClick={() => setActiveTab('cars')}
              >
                <i className="fas fa-car me-2"></i>
                Voitures
              </button>
              <button 
                className={`btn btn-sm ${activeTab === 'messages' ? 'btn-warning' : 'btn-outline-light'} rounded-pill px-3 fw-semibold position-relative`}
                onClick={() => setActiveTab('messages')}
              >
                <i className="fas fa-envelope me-2"></i>
                Messages
                {userContacts.filter(c => c.replies?.length > 0 && c.status === 'répondu').length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {userContacts.filter(c => c.replies?.length > 0 && c.status === 'répondu').length}
                  </span>
                )}
              </button>
            </div>

            <ul className="navbar-nav ms-auto align-items-center gap-2">
              <li className="nav-item">
                <Link to={`/profile/${user.id}`} className="nav-link btn btn-outline-light  text-white px-4 py-2 rounded-pill fw-bold border-2">
                  <i className="fas fa-user me-2"></i>
                  {user.name}
                </Link>
              </li>
              <li className="nav-item ms-lg-2">
                <button onClick={handleLogout} className="nav-link btn btn-danger text-white px-4 py-2 rounded-pill fw-bold">
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Message de bienvenue */}
        <div className="mb-4 p-4 bg-white rounded-4 shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 rounded-circle p-3">
              <i className="fas fa-user-circle fa-2x text-primary"></i>
            </div>
            <div>
              <h2 className="fw-bold mb-1">Bienvenue <span className="text-primary">{user?.name}</span> 👋</h2>
              <p className="text-muted mb-0">
                {activeTab === 'cars' 
                  ? 'Découvrez nos voitures disponibles et réservez en quelques clics.'
                  : 'Consultez vos messages et les réponses de notre équipe.'}
              </p>
              {activeTab === 'cars' && (
                <p className="text-success small mt-2 mb-0">
                  <i className="fas fa-info-circle me-1"></i>
                  Les voitures sont affichées par modèle unique. Si un modèle est réservé, nous vous montrons sa disponibilité.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* TAB CONTENT: VOITURES */}
        {activeTab === 'cars' && (
          <div>
            {/* Barre de recherche */}
            <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
              <h6 className="fw-bold mb-3">
                <i className="fas fa-search me-2 text-primary"></i>
                Rechercher une voiture
              </h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <select
                    onChange={(e) => setSelectValue(e.target.value)}
                    className="form-select rounded-pill"
                    value={selectValue}
                  >
                    <option value="">Tous les critères</option>
                    <option value="name">Nom du véhicule</option>
                    <option value="price">Prix par jour</option>
                    <option value="disponible">Disponibilité</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <div className="position-relative">
                    <input
                      type="text"
                      onChange={(e) => setInputValue(e.target.value)}
                      value={inputValue}
                      placeholder={selectValue === "price" ? "Ex: 400" : selectValue === "disponible" ? "Ex: disponible" : "Ex: Dacia"}
                      className="form-control rounded-pill ps-5"
                    />
                    <i className="fas fa-search position-absolute text-muted" 
                       style={{ left: '20px', top: '12px' }}></i>
                    {inputValue && (
                      <button 
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                        onClick={() => setInputValue("")}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Résultats de recherche */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">
                <i className="fas fa-car me-2 text-primary"></i>
                Nos véhicules ({carsSearch.length})
              </h5>
              <div className="text-muted small">
                <i className="fas fa-arrow-up me-1"></i>
                Survolez une carte pour voir les détails
              </div>
            </div>

            {/* Liste des voitures */}
            <div className="row g-4">
              {carsSearch.length === 0 ? (
                <div className="col-12">
                  <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                    <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                      <i className="fas fa-car fa-3x text-muted"></i>
                    </div>
                    <h5 className="text-muted mb-2">Aucune voiture trouvée</h5>
                    <p className="text-muted mb-4">Essayez de modifier vos critères de recherche</p>
                    <button 
                      className="btn btn-primary rounded-pill px-4"
                      onClick={() => {
                        setSelectValue("");
                        setInputValue("");
                      }}
                    >
                      <i className="fas fa-undo me-2"></i>
                      Réinitialiser
                    </button>
                  </div>
                </div>
              ) : (
                carsSearch.map((car) => (
                  <div key={car.id} className="col-md-6 col-lg-4">
                    <div className="card shadow-sm h-100 border-0 rounded-4 car-card">
                      <div className="position-relative">
                        <img 
                          src={car.image || 'https://via.placeholder.com/400x200'} 
                          className="card-img-top rounded-top-4" 
                          alt={car.name} 
                          style={{ height: "200px", objectFit: "cover" }} 
                        />
                        <span className={`position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-2 ${
                          car.status === "available" ? "bg-success" : "bg-warning"
                        }`}>
                          {car.status === "available" ? "● Disponible" : "● Réservé"}
                        </span>
                      </div>
                      
                      <div className="card-body d-flex flex-column p-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="fw-bold mb-1">{car.name}</h5>
                            <p className="text-muted small mb-0">
                              <i className="fas fa-map-marker-alt me-1"></i>
                              {car.location || 'Casablanca'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span className="badge bg-light text-dark rounded-pill">
                            <i className="fas fa-users me-1"></i>
                            {car.seats} places
                          </span>
                          <span className="badge bg-light text-dark rounded-pill">
                            <i className="fas fa-cog me-1"></i>
                            {car.transmission}
                          </span>
                          <span className="badge bg-light text-dark rounded-pill">
                            <i className="fas fa-gas-pump me-1"></i>
                            {car.fuel || 'Essence'}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <span className="fw-bold text-primary fs-4">
                              {car.pricePerDay} MAD
                            </span>
                            <span className="text-muted small"> /jour</span>
                          </div>
                          <span className="text-muted small">
                            <i className="fas fa-star text-warning me-1"></i>
                            4.8 (120 avis)
                          </span>
                        </div>

                        <Link 
                          to={car.status === "available" ? `/reservationVoiture/${car.id}` : '#'}
                          className={`btn btn-dark mt-auto rounded-pill py-2 fw-semibold ${
                            car.status !== "available" ? "disabled opacity-50" : ""
                          }`}
                          onClick={(e) => {
                            if (car.status !== "available") {
                              e.preventDefault();
                              alert("Ce véhicule n'est pas disponible pour le moment.");
                            }
                          }}
                        >
                          <i className="fas fa-calendar-check me-2"></i>
                          {car.status === "available" ? "Réserver maintenant" : "Indisponible"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="container py-4">
            <div className="row justify-content-center">
              <div className="col-xl-10">
                
                {userContacts.length === 0 ? (
                  /* --- État Vide --- */
                  <div className="text-center py-5 bg-white rounded-4 shadow-sm border-0">
                    <div className="mb-4">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                          style={{ width: '100px', height: '100px' }}>
                        <i className="bi bi-chat-dots fs-1 text-muted"></i>
                      </div>
                    </div>
                    <h3 className="fw-bold mb-2">Aucune conversation</h3>
                    <p className="text-muted mx-auto mb-4 px-3" style={{ maxWidth: '450px' }}>
                      Vous n'avez pas encore envoyé de message. Notre équipe est à votre écoute pour toute question.
                    </p>
                    <Link to="/" className="btn btn-primary btn-lg rounded-pill px-5 shadow-sm">
                      <i className="bi bi-envelope-paper me-2"></i>
                      Nouveau message
                    </Link>
                  </div>
                ) : (
                  /* --- Liste des Messages --- */
                  <>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <h4 className="fw-bold mb-0">
                        <span className="badge bg-primary me-2 rounded-pill">
                          {userContacts.length}
                        </span>
                        Messages
                      </h4>
                      <div className="dropdown">
                        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" type="button" data-bs-toggle="dropdown">
                          <i className="bi bi-funnel me-1"></i> Filtrer
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                          <li><a className="dropdown-item" href="#">Tous les messages</a></li>
                          <li><a className="dropdown-item" href="#">Non lus</a></li>
                          <li><a className="dropdown-item" href="#">Avec réponse</a></li>
                        </ul>
                      </div>
                    </div>

                    <div className="row g-4">
                      {userContacts.map(contact => (
                        <div key={contact.id} className="col-12">
                          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            {/* Header avec Statut */}
                            <div className="card-header bg-white border-bottom-0 p-4">
                              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                <div className="d-flex align-items-center gap-3">
                                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                                      style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-person-circle text-primary fs-4"></i>
                                  </div>
                                  <div>
                                    <h5 className="fw-bold text-dark mb-1">{contact.subject}</h5>
                                    <div className="d-flex align-items-center gap-3">
                                      <span className="text-muted small">
                                        <i className="bi bi-clock me-1"></i> 
                                        {formatDate(contact.date)}
                                      </span>
                                      {contact.replies && contact.replies.length > 0 && (
                                        <span className="badge bg-light text-dark rounded-pill">
                                          <i className="bi bi-chat-text me-1"></i>
                                          {contact.replies.length} réponse(s)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className={`badge rounded-pill px-3 py-2 ${
                                  contact.status === 'répondu' ? 'bg-success' : 
                                  contact.status === 'lu' ? 'bg-info' : 'bg-warning'
                                }`}>
                                  <i className={`bi ${
                                    contact.status === 'répondu' ? 'bi-check-circle' : 
                                    contact.status === 'lu' ? 'bi-eye' : 'bi-hourglass-split'
                                  } me-1`}></i>
                                  {contact.status === 'répondu' ? 'Répondu' : 
                                  contact.status === 'lu' ? 'Lu' : 'En attente'}
                                </span>
                              </div>
                            </div>

                            <div className="card-body p-4 pt-0">
                              {/* Fil de discussion */}
                              <div className="position-relative">
                                {/* Ligne de temps verticale */}
                                <div className="position-absolute start-0 top-0 bottom-0" 
                                    style={{ width: '2px', background: 'linear-gradient(180deg, #0d6efd 0%, #20c997 100%)' }}>
                                </div>
                                
                                {/* Message Client */}
                                <div className="ps-4 mb-4 position-relative">
                                  <div className="position-absolute start-0 top-0 translate-middle-x bg-primary rounded-circle p-1 border border-2 border-white"
                                      style={{ marginLeft: '-1px', width: '16px', height: '16px' }}></div>
                                  <div className="bg-light rounded-3 p-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                      <span className="fw-bold text-primary">Vous</span>
                                      <span className="badge bg-primary-subtle text-primary rounded-pill">
                                        Message original
                                      </span>
                                    </div>
                                    <p className="mb-0 text-secondary">{contact.message}</p>
                                  </div>
                                </div>

                                {/* Réponses Équipe */}
                                {contact.replies && contact.replies.length > 0 ? (
                                  contact.replies.map((reply, index) => (
                                    <div key={index} className="ps-4 mb-3 position-relative">
                                      <div className="position-absolute start-0 top-0 translate-middle-x bg-success rounded-circle p-1 border border-2 border-white"
                                          style={{ marginLeft: '-1px', width: '16px', height: '16px' }}></div>
                                      <div className="bg-success bg-opacity-10 rounded-3 p-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                          <span className="fw-bold text-success">
                                            <i className="bi bi-headset me-1"></i>
                                            Support Technique
                                          </span>
                                          <span className="badge bg-success-subtle text-success rounded-pill">
                                            <i className="bi bi-check2-circle me-1"></i>
                                            Réponse
                                          </span>
                                        </div>
                                        <p className="mb-2 text-dark">{reply.message}</p>
                                        <span className="text-muted small">
                                          <i className="bi bi-clock me-1"></i>
                                          {formatDate(reply.date)}
                                        </span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  /* État d'attente */
                                  <div className="ps-4 position-relative">
                                    <div className="bg-light bg-opacity-50 rounded-3 p-4 text-center">
                                      <div className="spinner-border text-primary spinner-border-sm me-2" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                      </div>
                                      <span className="text-muted">
                                        Notre équipe traite votre demande. Vous recevrez une réponse sous 24h.
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Footer avec actions */}
                            {contact.status !== 'répondu' && (
                              <div className="card-footer bg-white border-0 p-4 pt-0">
                                <div className="d-flex gap-2">
                                  <button className="btn btn-outline-primary rounded-pill flex-grow-1">
                                    <i className="bi bi-pencil me-2"></i>
                                    Modifier le message
                                  </button>
                                  <button className="btn btn-outline-secondary rounded-pill">
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5 className="fw-bold">
                <i className="fas fa-car me-2 text-warning"></i>
                Auto<span className="text-warning">booking</span>
              </h5>
              <p className="text-white-50 small">
                Votre partenaire de confiance pour la location de voitures.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="text-white-50 small mb-0">
                &copy; 2024 Autobooking. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default DashboardClient;