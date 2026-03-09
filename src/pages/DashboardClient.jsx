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
      navigate("/login");
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

  const carsSearch = allCars.filter((car) => {
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
    dispatch(deconnecter());
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'client') return null;

  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary py-3 mb-4">
        <div className="container">
          <Link className="navbar-brand fw-bold fs-4" to="/">
            <i className="fas fa-car me-2"></i>
            Auto<span className="text-warning">booking</span>
          </Link>

          {/* Tabs de navigation */}
          <div className="d-flex gap-2 ms-4">
            <button 
              className={`btn btn-sm ${activeTab === 'cars' ? 'btn-warning' : 'btn-outline-light'} rounded-pill px-3`}
              onClick={() => setActiveTab('cars')}
            >
              <i className="fas fa-car me-2"></i>
              Voitures
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'messages' ? 'btn-warning' : 'btn-outline-light'} rounded-pill px-3 position-relative`}
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

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center gap-2">
              <li className="nav-item">
                <Link to={`/profile/${user.id}`} className="nav-link btn btn-outline-light text-white px-4 py-2 rounded-pill fw-bold border-2">
                  <i className="fas fa-user me-2"></i>
                  Profil
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
        <div className="mb-4 p-4 bg-light rounded-4 shadow-sm">
          <h2 className="fw-bold">Bienvenue <span className="text-warning">{user?.name}</span> 👋</h2>
          <p className="text-muted mb-0">
            {activeTab === 'cars' 
              ? 'Découvrez nos voitures disponibles et réservez en quelques clics.'
              : 'Consultez vos messages et les réponses de notre équipe.'}
          </p>
        </div>

        {/* TAB CONTENT: VOITURES */}
        {activeTab === 'cars' && (
          <div>
            {/* Barre de recherche */}
            <div className="d-none d-lg-block mb-4">
              <form className="d-flex gap-2">
                <select
                  onChange={(e) => setSelectValue(e.target.value)}
                  className="form-select form-select-sm"
                  style={{ width: '150px' }}
                >
                  <option value="">Tous</option>
                  <option value="name">Nom</option>
                  <option value="price">Prix</option>
                  <option value="disponible">Disponibilité</option>
                </select>
                <div className="position-relative flex-grow-1">
                  <input
                    type="text"
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Rechercher une voiture..."
                    className="form-control form-control-sm"
                    style={{ paddingLeft: '2.2rem' }}
                  />
                  <i className="fas fa-search position-absolute text-muted" 
                     style={{ left: '12px', top: '8px', fontSize: '0.8rem' }}></i>
                </div>
              </form>
            </div>

            {/* Liste des voitures */}
            <div className="row">
              {carsSearch.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-car fa-3x mb-3"></i>
                  <p>Aucune voiture trouvée.</p>
                </div>
              ) : (
                carsSearch.map((car) => (
                  <div key={car.id} className="col-md-4 mb-4">
                    <div className="card shadow-sm h-100 border-0 rounded-4 car-card">
                      <img 
                        src={car.image} 
                        className="card-img-top rounded-top-4" 
                        alt={car.name} 
                        style={{ height: "200px", objectFit: "cover" }} 
                      />
                      <div className="card-body d-flex flex-column p-4">
                        <h5 className="fw-bold">{car.name}</h5>
                        <div className="small text-muted mb-2">
                          <p className="mb-1">
                            <i className="fas fa-users me-2"></i>
                            {car.seats} places
                          </p>
                          <p className="mb-1">
                            <i className="fas fa-cog me-2"></i>
                            {car.transmission}
                          </p>
                        </div>
                        <p className="fw-bold text-primary fs-5 mb-3">
                          {car.pricePerDay} MAD <small className="text-muted fw-normal">/jour</small>
                        </p>
                        <span className={`badge mb-3 py-2 ${car.status === "available" ? "bg-success" : "bg-warning"}`}>
                          {car.status === "available" ? "Disponible" : "Réservé"}
                        </span>

                        <Link 
                          to={`/reservationVoiture/${car.id}`} 
                          className={`btn btn-dark mt-auto rounded-pill ${car.status !== "available" ? "disabled" : ""}`}
                        >
                          <i className="fas fa-calendar-check me-2"></i>
                          Réserver
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
          <div className="row">
            <div className="col-12">
              {userContacts.length === 0 ? (
                <div className="text-center py-5">
                  <div className="bg-light rounded-4 p-5">
                    <i className="fas fa-envelope-open-text fa-4x text-muted mb-3"></i>
                    <h5 className="text-muted">Vous n'avez aucun message</h5>
                    <p className="text-muted mb-4">
                      Utilisez le formulaire de contact sur la page d'accueil pour nous écrire.
                    </p>
                    <Link to="/" className="btn btn-primary rounded-pill px-4">
                      <i className="fas fa-home me-2"></i>
                      Retour à l'accueil
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="row">
                  {userContacts.map(contact => (
                    <div key={contact.id} className="col-md-6 mb-4">
                      <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-0 p-4">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="fw-bold mb-1">{contact.subject}</h5>
                              <small className="text-muted">
                                <i className="fas fa-clock me-1"></i>
                                Envoyé le {formatDate(contact.date)}
                              </small>
                            </div>
                            <span className={`badge ${
                              contact.status === 'répondu' ? 'bg-success' : 
                              contact.status === 'lu' ? 'bg-info' : 'bg-warning'
                            }`}>
                              {contact.status === 'répondu' ? 'Répondu' : 
                               contact.status === 'lu' ? 'Lu' : 'En attente'}
                            </span>
                          </div>
                        </div>

                        <div className="card-body p-4">
                          {/* Message original */}
                          <div className="mb-4">
                            <h6 className="fw-bold mb-2">Votre message :</h6>
                            <div className="bg-light rounded-3 p-3">
                              <p className="mb-0">{contact.message}</p>
                            </div>
                          </div>

                          {/* Réponse de l'équipe */}
                          {contact.replies && contact.replies.length > 0 && (
                            <div>
                              <h6 className="fw-bold text-success mb-2">
                                <i className="fas fa-reply me-2"></i>
                                Réponse de notre équipe :
                              </h6>
                              {contact.replies.map(reply => (
                                <div key={reply.id} className="bg-success bg-opacity-10 rounded-3 p-3">
                                  <p className="mb-2">{reply.message}</p>
                                  <small className="text-muted">
                                    <i className="fas fa-clock me-1"></i>
                                    Répondu le {formatDate(reply.date)}
                                  </small>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Message d'attente */}
                          {(!contact.replies || contact.replies.length === 0) && (
                            <div className="text-center text-muted py-3">
                              <i className="fas fa-clock fa-2x mb-2"></i>
                              <p>En attente d'une réponse de notre équipe</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      
    </>
  );
};

export default DashboardClient;