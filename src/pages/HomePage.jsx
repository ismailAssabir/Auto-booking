import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { deconnecter } from "../features/auth/authSlice";
import { addContact } from "../features/contact/contactsSlice";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  // Récupération des données globales via Redux
  const user = useSelector((state) => state.auth.user);
  const allCars = useSelector((state) => state.cars.cars) || [];

  // Action de déconnexion
  const handleLogout = () => {
    if (window.confirm("Voulez-vous vous déconnecter ?")) {
      dispatch(deconnecter());
      navigate("/login");
    }
  };

  const handleReserveClick = (carId) => {
    navigate(`/reservationNow/${carId}`);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation des données
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      alert("Tous les champs sont requis");
      setLoading(false);
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      alert("Veuillez entrer un email valide");
      setLoading(false);
      return;
    }

    // Ajout du contact via Redux
    dispatch(addContact({
      ...contactForm,
      userId: user?.id || null,
      userAvatar: user?.avatar || null
    }));

    // Reset et fermeture
    setTimeout(() => {
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setShowContactModal(false);
      setLoading(false);
      alert("✅ Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.");
    }, 500);
  };

  return (
    <div className="bg-light min-vh-100">
      {/* --- MODAL DE CONTACT --- */}
      {showContactModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          onClick={() => !loading && setShowContactModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-headset me-2"></i>
                  Contactez-nous
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => !loading && setShowContactModal(false)}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleContactSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-user text-primary me-2"></i>
                      Nom complet
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-3"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      disabled={loading}
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-envelope text-primary me-2"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg rounded-3"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      disabled={loading}
                      placeholder="jean@exemple.com"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-tag text-primary me-2"></i>
                      Sujet
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-3"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      disabled={loading}
                      placeholder="Objet de votre message"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-comment text-primary me-2"></i>
                      Message
                    </label>
                    <textarea
                      className="form-control form-control-lg rounded-3"
                      rows="4"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      disabled={loading}
                      placeholder="Votre message..."
                      required
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary flex-grow-1 py-3 fw-bold rounded-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Envoyer le message
                        </>
                      )}
                    </button>
                    
                    <button 
                      type="button"
                      className="btn btn-outline-secondary px-4 rounded-3"
                      onClick={() => {
                        setShowContactModal(false);
                        setContactForm({ name: "", email: "", subject: "", message: "" });
                      }}
                      disabled={loading}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NAVIGATION --- */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary py-3 fixed-top shadow-lg">
        <div className="container">
          <Link className="navbar-brand fw-bold fs-3 d-flex align-items-center" to="/">
            <div className="position-relative d-flex align-items-center justify-content-center bg-white shadow-sm me-3"
                 style={{ width: "50px", height: "50px", borderRadius: "15px", border: "2px solid #ffc107" }}>
              <img src="../logo.jpg" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span className="text-white">Auto<span className="text-warning">booking</span></span>
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center gap-2">
              <li className="nav-item">
                <a href="#cars" className="nav-link text-white-50 fw-bold">Nos véhicules</a>
              </li>
              <li className="nav-item">
                <a href="#services" className="nav-link text-white-50 fw-bold">Services</a>
              </li>
              
              {/* Bouton Contact */}
              <li className="nav-item">
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="btn btn-outline-light rounded-pill px-4 py-2 fw-bold border-2 me-2"
                >
                  <i className="fas fa-envelope me-2"></i>
                  Contact
                </button>
              </li>

              {!user ? (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="btn btn-outline-light text-white px-4 py-2 rounded-pill fw-bold border-2 me-2">
                      Connexion
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/inscription" className="btn btn-warning text-dark px-4 py-2 rounded-pill fw-bold shadow-sm">
                      S'inscrire
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item me-3">
                    <Link to={user.role === 'admin' ? '/dashboard/chef' : user.role === 'client' ? '/dashboard/client' : '/dashboard/personnel'} 
                          className="nav-link text-white fw-bold">
                      <i className="fas fa-th-large me-1"></i> Mon Espace
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button onClick={handleLogout} className="btn btn-danger text-white px-4 py-2 rounded-pill fw-bold shadow-sm">
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Déconnexion
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Spacer pour navbar */}
      <div style={{ height: "90px" }}></div>

      {/* --- HERO SECTION --- */}
      <header className="bg-primary text-white py-5 mb-5 position-relative overflow-hidden">
        <div className="container py-5 text-center position-relative" style={{ zIndex: 2 }}>
          <h1 className="display-3 fw-bold mb-3 animate__animated animate__fadeInDown">
            Louez la liberté au Maroc
          </h1>
          <p className="lead fs-4 mb-4 opacity-75 animate__animated animate__fadeInUp">
            Choisissez parmi plus de {allCars.length} véhicules récents au meilleur prix.
          </p>
          {!user && (
            <Link to="/inscription" className="btn btn-warning btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg animate__animated animate__pulse animate__infinite">
              Commencer l'aventure <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          )}
        </div>
        {/* Décoration */}
        <div className="position-absolute top-0 start-0 w-100 h-100">
          <div className="position-absolute" style={{ top: '10%', left: '5%', opacity: '0.1', transform: 'rotate(-15deg)' }}>
            <i className="fas fa-car fa-10x"></i>
          </div>
          <div className="position-absolute" style={{ bottom: '10%', right: '5%', opacity: '0.1', transform: 'rotate(15deg)' }}>
            <i className="fas fa-key fa-10x"></i>
          </div>
        </div>
      </header>

      {/* --- SECTION SERVICES --- */}
      <section id="services" className="container py-5">
        <h2 className="text-center fw-bold mb-5">Nos Services</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-shield-alt text-primary fa-3x"></i>
              </div>
              <h5 className="fw-bold">Assurance incluse</h5>
              <p className="text-muted">Tous nos véhicules sont assurés pour votre tranquillité d'esprit.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-headset text-success fa-3x"></i>
              </div>
              <h5 className="fw-bold">Support 24/7</h5>
              <p className="text-muted">Une équipe disponible à tout moment pour vous assister.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100">
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-clock text-warning fa-3x"></i>
              </div>
              <h5 className="fw-bold">Flexibilité totale</h5>
              <p className="text-muted">Annulation gratuite jusqu'à 24h avant le départ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION FLOTTE AUTO --- */}
      <section id="cars" className="container py-4">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="fw-bold mb-0">🏎️ Notre Flotte Exclusive</h2>
            <p className="text-muted mb-0">Véhicules révisés et prêts pour la route.</p>
          </div>
          <span className="badge bg-primary px-4 py-2 rounded-pill">
            {allCars.filter(c => c.status === 'available').length} disponibles
          </span>
        </div>

        <div className="row g-4">
          {allCars.length === 0 ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
              <p className="text-muted">Chargement de la flotte...</p>
            </div>
          ) : (
            allCars.map((car) => (
              <div key={car.id} className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="position-relative">
                    <img 
                      src={car.image || 'https://via.placeholder.com/400x250'} 
                      className="card-img-top" 
                      alt={car.name} 
                      style={{ height: "220px", objectFit: "cover" }}
                    />
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className={`badge px-3 py-2 rounded-pill shadow ${car.status === 'available' ? 'bg-success' : 'bg-danger'}`}>
                        {car.status === 'available' ? 'Disponible' : 'Louée'}
                      </span>
                    </div>
                    {car.status === 'available' && (
                      <div className="position-absolute top-0 start-0 m-3">
                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow">
                          <i className="fas fa-tag me-1"></i>
                          -20%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="fw-bold text-dark mb-1">{car.name}</h5>
                    <div className="d-flex gap-3 text-muted small mb-3">
                      <span><i className="fas fa-users me-1"></i> {car.seats} Places</span>
                      <span><i className="fas fa-cog me-1"></i> {car.transmission}</span>
                    </div>
                    
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-bold text-primary fs-4">{car.pricePerDay}</span>
                        <small className="text-muted ms-1">MAD/j</small>
                      </div>
                      
                      <button 
                        onClick={() => handleReserveClick(car.id)}
                        className={`btn btn-dark rounded-pill px-4 fw-bold ${car.status !== 'available' ? 'disabled opacity-50' : ''}`}
                      >
                        {car.status === 'available' ? 'Réserver' : 'Indisponible'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* --- SECTION NEWSLETTER --- */}
      <section className="bg-primary text-white py-5 mt-5">
        <div className="container text-center">
          <h3 className="fw-bold mb-3">Restez informé</h3>
          <p className="mb-4 opacity-75">Recevez nos meilleures offres directement dans votre boîte mail</p>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="input-group">
                <input type="email" className="form-control form-control-lg rounded-start-3" placeholder="Votre email" />
                <button className="btn btn-warning fw-bold px-5 rounded-end-3">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h4 className="fw-bold mb-3">Auto<span className="text-warning">booking</span></h4>
              <p className="text-white-50 mb-4">La solution numéro 1 pour la location de voiture au Maroc. Confort, sécurité et simplicité.</p>
              <div className="d-flex gap-3">
                <a href="#" className="text-white-50 fs-4"><i className="fab fa-facebook"></i></a>
                <a href="#" className="text-white-50 fs-4"><i className="fab fa-instagram"></i></a>
                <a href="#" className="text-white-50 fs-4"><i className="fab fa-linkedin"></i></a>
                <a href="#" className="text-white-50 fs-4"><i className="fab fa-whatsapp"></i></a>
              </div>
            </div>
            
            <div className="col-md-2">
              <h5 className="mb-3">Liens rapides</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#cars" className="text-white-50 text-decoration-none">Nos véhicules</a></li>
                <li className="mb-2"><a href="#services" className="text-white-50 text-decoration-none">Services</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Conditions</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">FAQ</a></li>
              </ul>
            </div>

            <div className="col-md-3">
              <h5 className="mb-3">Contact</h5>
              <ul className="list-unstyled">
                <li className="mb-2 text-white-50">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Casablanca, Maroc
                </li>
                <li className="mb-2 text-white-50">
                  <i className="fas fa-phone me-2"></i>
                  +212 5XX-XXXXXX
                </li>
                <li className="mb-2 text-white-50">
                  <i className="fas fa-envelope me-2"></i>
                  contact@autobooking.ma
                </li>
              </ul>
            </div>

            <div className="col-md-3">
              <h5 className="mb-3">Horaires</h5>
              <ul className="list-unstyled">
                <li className="mb-2 text-white-50">
                  <i className="fas fa-clock me-2"></i>
                  Lun-Ven: 8h-20h
                </li>
                <li className="mb-2 text-white-50">
                  <i className="fas fa-clock me-2"></i>
                  Sam: 9h-18h
                </li>
                <li className="mb-2 text-white-50">
                  <i className="fas fa-clock me-2"></i>
                  Dim: 10h-14h
                </li>
              </ul>
            </div>
          </div>

          <hr className="my-4 opacity-25" />
          
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0 small text-white-50">© 2026 AutoBooking Maroc. Tous droits réservés.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <a href="#" className="text-white-50 text-decoration-none small me-3">Mentions légales</a>
              <a href="#" className="text-white-50 text-decoration-none small">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;