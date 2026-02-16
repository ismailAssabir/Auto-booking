import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react"; // Ajout de useEffect
import { Link, useNavigate } from "react-router-dom";
import { deconnecter } from "../features/auth/authSlice";

const DashboardClient = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectValue, setSelectValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  
  const allCars = useSelector((state) => state.cars.cars);
  const user = useSelector((state) => state.auth.user);
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
  // --- SÉCURITÉ : REDIRECTION SI NON-CLIENT ---
  useEffect(() => {
    // Si l'utilisateur n'est pas connecté ou n'est pas un client
    if (!user || user.role !== 'client') {
      navigate('/'); // Redirection vers homepage
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

  // Si l'utilisateur n'est pas client, on ne rend rien le temps de la redirection
  if (!user || user.role !== 'client') return null;

  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary py-3 mb-4">
        <div className="container">
          <span className="navbar-brand fw-bold fs-4">
            <i className="fas fa-car me-2"></i>
            Auto<span className="text-warning">booking</span>
          </span>

          <div className="d-none d-lg-block mx-4 flex-grow-1" style={{ maxWidth: '500px' }}>
            <form className="d-flex gap-2">
              <select
                onChange={(e) => setSelectValue(e.target.value)}
                className="form-select form-select-sm bg-white bg-opacity-25 text-white border-0"
                style={{ backdropFilter: 'blur(10px)' }}
              >
                <option value="" className="bg-primary">Tous</option>
                <option value="name" className="bg-primary">Nom</option>
                <option value="price" className="bg-primary">Prix</option>
                <option value="disponible" className="bg-primary">Disponibilité</option>
              </select>
              <div className="position-relative flex-grow-1">
                <input
                  type="text"
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Rechercher une voiture..."
                  className="form-control form-control-sm bg-white bg-opacity-25 text-white border-0"
                  style={{ backdropFilter: 'blur(10px)', paddingLeft: '2.2rem' }}
                />
                <i className="fas fa-search position-absolute text-white-50" 
                   style={{ left: '12px', top: '8px', fontSize: '0.8rem' }}></i>
              </div>
            </form>
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
        <div className="mb-4 p-4 bg-light rounded-4 shadow-sm">
          <h2 className="fw-bold">Bienvenue <span className="text-warning">{user?.name}</span> 👋</h2>
          <p className="text-muted mb-0">Découvrez nos voitures disponibles et réservez en quelques clics.</p>
        </div>

        <div className="row">
          {carsSearch.length === 0 ? (
            <div className="text-center text-muted">Aucune voiture trouvée.</div>
          ) : (
            carsSearch.map((car) => (
              <div key={car.id} className="col-md-4 mb-4">
                <div className="card shadow-sm h-100 border-0 rounded-4 car-card">
                  <img src={car.image} className="card-img-top" alt={car.name} style={{ height: "200px", objectFit: "cover" }} />
                  <div className="card-body d-flex flex-column">
                    <h5 className="fw-bold">{car.name}</h5>
                    <div className="small text-muted mb-2">
                      <p className="mb-1">💺 {car.seats} places | ⚙ {car.transmission}</p>
                    </div>
                    <p className="fw-bold text-primary fs-5">{car.pricePerDay} MAD / jour</p>
                    <span className={`badge mb-3 py-2 ${car.status === "available" ? "bg-success" : "bg-warning"}`}>
                      {car.status}
                    </span>

                    {/* --- REDIRECTION VERS RÉSERVATION --- */}
                    <Link 
                      to={`/reservationVoiture/${car.id}`} 
                      className={`btn btn-dark mt-auto rounded-pill ${car.status !== "available" ? "disabled" : ""}`}
                    >
                      Réserver
                    </Link>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardClient;