import { Link } from "react-router-dom";

export default function HomePage() {

    return (
        <div className="bg-light min-vh-100">
            <header>
                <nav className='navbar navbar-expand-lg navbar-dark fixed-top transition-all duration-300bg-transparent py-3'
                >
                    <div className="container">
                        <Link className="navbar-brand fw-bold fs-3 d-flex align-items-center" to="/">
                            <div className="bg-white bg-opacity-20 p-2 rounded-circle me-2">
                                <i className="fas fa-car text-white"></i>
                            </div>
                            <span className="text-dark">Auto</span>
                            <span className="text-warning">booking</span>
                        </Link>
                        <button 
                            className="navbar-toggler border-0" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#navbarNav"
                            aria-controls="navbarNav"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav ms-auto align-items-center gap-2">
                                
                                
                                <li className="nav-item">
                                    <Link 
                                        className="nav-link btn btn-warning text-dark px-4 py-2 rounded-pill fw-bold shadow-sm hover-shadow-lg transition-all" 
                                        to="/login"
                                    >
                                        <i className="fas fa-sign-in-alt me-2"></i>
                                        <span>Connexion</span>
                                    </Link>
                                </li>
                                <li className="nav-item ms-lg-2">
                                    <Link 
                                        className="nav-link btn btn-warning text-dark px-4 py-2 rounded-pill fw-bold shadow-sm hover-shadow-lg transition-all" 
                                        to="/inscription"
                                    >
                                        <i className="fas fa-calendar-check me-2"></i>
                                        <span>Inscription</span>
                                        <i className="fas fa-arrow-right ms-2 fa-sm"></i>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <div style={{ height: '76px' }}></div>
            </header>
            <section className="bg-primary text-white py-5">
                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <h1 className="display-3 fw-bold mb-4">
                                Louez la voiture<br />de vos rêves
                            </h1>
                            <p className="lead mb-4 opacity-90">
                                Des véhicules de qualité à des prix compétitifs. 
                                Livraison et retour gratuits dans tout le Maroc.
                            </p>
                            <div className="d-flex gap-4">
                                <div className="text-center">
                                    <h2 className="h1 fw-bold mb-0">500+</h2>
                                    <p className="mb-0 opacity-75">Véhicules</p>
                                </div>
                                <div className="text-center">
                                    <h2 className="h1 fw-bold mb-0">10k+</h2>
                                    <p className="mb-0 opacity-75">Clients</p>
                                </div>
                                <div className="text-center">
                                    <h2 className="h1 fw-bold mb-0">15</h2>
                                    <p className="mb-0 opacity-75">Agences</p>
                                </div>
                            </div>
                        </div>
    
                    </div>
                </div>
            </section>

        </div>
    );
}