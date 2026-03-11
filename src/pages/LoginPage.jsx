import { useDispatch, useSelector } from "react-redux";
import { connecter } from "../features/auth/authSlice";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const { erreur, user, autentifier } = useSelector(state => state.auth);
    const users = useSelector(state => state.users?.users || []);

    useEffect(() => {
        if (autentifier && user) {
            const redirectPath = 
                user.role === 'admin' ? '/dashboard/chef' :
                user.role === 'employee' || user.role === 'employe' ? '/dashboard/personnel' :
                user.role === 'client' ? '/dashboard/client' : '/';
            navigate(redirectPath);
        }
    }, [autentifier, user, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        setTimeout(() => {
            const foundUser = users.find(u => 
                u.email === email && u.password === password
            );
            
            if (foundUser) {
                dispatch(connecter(foundUser));
            } else {
                dispatch(connecter({ err: 1 }));
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="container-fluid bg-light min-vh-100 d-flex align-items-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6 col-xl-5">
                        
                        {/* Bouton retour professionnel */}
                        <div className="mb-4">
                            <Link 
                                to="/" 
                                className="btn btn-outline-secondary rounded-pill px-4 py-2 d-inline-flex align-items-center shadow-sm"
                                style={{ 
                                    transition: 'all 0.3s ease',
                                    borderWidth: '1.5px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(-5px)';
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    e.currentTarget.style.borderColor = '#6c757d';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = '#dee2e6';
                                }}
                            >
                                <i className="fas fa-arrow-left me-2"></i>
                                <span className="fw-medium">Retour à l'accueil</span>
                            </Link>
                        </div>

                        {/* Logo */}
                        <div className="text-center mb-4">
                            <Link to="/" className="text-decoration-none">
                                <h1 className="display-5 fw-bold text-primary">
                                    <i className="fas fa-car me-2"></i>
                                    Auto<span className="text-warning">Booking</span>
                                </h1>
                            </Link>
                            <p className="text-muted">Gérez vos réservations en toute simplicité</p>
                        </div>
                      
                        {/* Card */}
                        <div className="card border-0 shadow rounded-4">
                            <div className="card-body p-4 p-lg-5">
                                <h4 className="fw-bold text-center mb-4">Connexion à votre compte</h4>
                                
                                {erreur && (
                                    <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        <span>Email ou mot de passe incorrect</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">Email</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fas fa-envelope text-primary"></i>
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="nom@exemple.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">Mot de passe</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fas fa-lock text-primary"></i>
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control border-start-0 ps-0"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary border-start-0"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{ borderLeft: 'none' }}
                                            >
                                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="remember" />
                                            <label className="form-check-label text-muted" htmlFor="remember">
                                                Se souvenir de moi
                                            </label>
                                        </div>
                                        <Link to="/forget" className="text-primary small text-decoration-none">
                                            Mot de passe oublié ?
                                        </Link>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm"
                                        disabled={isLoading}
                                        style={{ transition: 'all 0.3s ease' }}
                                        onMouseEnter={(e) => {
                                            if (!isLoading) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isLoading) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                                            }
                                        }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Connexion...
                                            </>
                                        ) : (
                                            'Se connecter'
                                        )}
                                    </button>

                                    <div className="text-center mt-4">
                                        <p className="text-muted mb-0">
                                            Pas encore de compte ?{' '}
                                            <Link to="/inscription" className="text-primary fw-bold text-decoration-none">
                                                S'inscrire
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-4">
                            <small className="text-muted">
                                © 2024 AutoBooking. Tous droits réservés.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}