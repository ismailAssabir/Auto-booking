import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgetPassword() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
    const [code, setCode] = useState(['', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Simulation d'envoi de code (à remplacer par un appel API)
    const handleSendCode = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simuler l'envoi d'email
        setTimeout(() => {
            setMessage({ 
                type: 'success', 
                text: 'Un code de vérification a été envoyé à votre adresse email.' 
            });
            setStep(2);
            setIsLoading(false);
        }, 1500);
    };

    // Vérification du code
    const handleVerifyCode = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const enteredCode = code.join('');
        // Simuler la vérification du code (à remplacer par une vraie validation)
        setTimeout(() => {
            if (enteredCode === '1234') { // Code de démo
                setStep(3);
                setMessage({ type: 'success', text: 'Code vérifié avec succès !' });
            } else {
                setMessage({ type: 'danger', text: 'Code incorrect. Veuillez réessayer.' });
            }
            setIsLoading(false);
        }, 1000);
    };

    // Réinitialisation du mot de passe
    const handleResetPassword = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validation des mots de passe
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'danger', text: 'Les mots de passe ne correspondent pas.' });
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'danger', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
            setIsLoading(false);
            return;
        }

        // Simuler la réinitialisation (à remplacer par un appel API)
        setTimeout(() => {
            setMessage({ 
                type: 'success', 
                text: 'Mot de passe réinitialisé avec succès ! Redirection vers la connexion...' 
            });
            
            // Redirection après 2 secondes
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            
            setIsLoading(false);
        }, 1500);
    };

    // Gestion du code à 4 chiffres
    const handleCodeChange = (index, value) => {
        if (value.length > 1) return; // Empêcher plus d'un chiffre
        
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus sur le champ suivant
        if (value && index < 3) {
            document.getElementById(`code-${index + 1}`).focus();
        }
    };

    const handleCodeKeyDown = (index, e) => {
        // Focus sur le champ précédent avec backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`).focus();
        }
    };

    return (
        <div className="container-fluid bg-light min-vh-100 d-flex align-items-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6 col-xl-5">
                        {/* Logo */}
                        <div className="text-center mb-4">
                            <Link to="/" className="text-decoration-none">
                                <h1 className="display-5 fw-bold text-primary">
                                    <i className="fas fa-car me-2"></i>
                                    Auto<span className="text-warning">Booking</span>
                                </h1>
                            </Link>
                            <p className="text-muted">Récupération de mot de passe</p>
                        </div>

                        {/* Progress Steps */}
                        <div className="d-flex justify-content-center mb-4">
                            <div className="text-center mx-2">
                                <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-light border'}`}
                                     style={{ width: '40px', height: '40px' }}>
                                    1
                                </div>
                                <small className={step >= 1 ? 'text-primary fw-bold' : 'text-muted'}>Email</small>
                            </div>
                            <div className="align-self-center" style={{ width: '40px', height: '2px', background: step >= 2 ? '#0d6efd' : '#dee2e6' }}></div>
                            <div className="text-center mx-2">
                                <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-light border'}`}
                                     style={{ width: '40px', height: '40px' }}>
                                    2
                                </div>
                                <small className={step >= 2 ? 'text-primary fw-bold' : 'text-muted'}>Code</small>
                            </div>
                            <div className="align-self-center" style={{ width: '40px', height: '2px', background: step >= 3 ? '#0d6efd' : '#dee2e6' }}></div>
                            <div className="text-center mx-2">
                                <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-light border'}`}
                                     style={{ width: '40px', height: '40px' }}>
                                    3
                                </div>
                                <small className={step >= 3 ? 'text-primary fw-bold' : 'text-muted'}>Nouveau</small>
                            </div>
                        </div>

                        {/* Card */}
                        <div className="card border-0 shadow rounded-4">
                            <div className="card-body p-4 p-lg-5">
                                {/* Message d'alerte */}
                                {message.text && (
                                    <div className={`alert alert-${message.type} d-flex align-items-center mb-4`} role="alert">
                                        <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                                        <span>{message.text}</span>
                                    </div>
                                )}

                                {/* Étape 1: Saisie de l'email */}
                                {step === 1 && (
                                    <form onSubmit={handleSendCode}>
                                        <h4 className="fw-bold text-center mb-4">Mot de passe oublié ?</h4>
                                        <p className="text-muted text-center mb-4">
                                            Saisissez votre adresse email pour recevoir un code de vérification.
                                        </p>

                                        <div className="mb-4">
                                            <label className="form-label fw-semibold">Adresse Email</label>
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

                                        <button 
                                            type="submit" 
                                            className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-3"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-paper-plane me-2"></i>
                                                    Envoyer le code
                                                </>
                                            )}
                                        </button>

                                        <div className="text-center">
                                            <Link to="/login" className="text-primary small">
                                                <i className="fas fa-arrow-left me-1"></i>
                                                Retour à la connexion
                                            </Link>
                                        </div>
                                    </form>
                                )}

                                {/* Étape 2: Saisie du code */}
                                {step === 2 && (
                                    <form onSubmit={handleVerifyCode}>
                                        <h4 className="fw-bold text-center mb-4">Code de vérification</h4>
                                        <p className="text-muted text-center mb-4">
                                            Saisissez le code à 4 chiffres envoyé à<br />
                                            <strong>{email}</strong>
                                        </p>

                                        <div className="d-flex justify-content-center gap-2 mb-4">
                                            {[0, 1, 2, 3].map((index) => (
                                                <input
                                                    key={index}
                                                    id={`code-${index}`}
                                                    type="text"
                                                    className="form-control text-center fw-bold"
                                                    style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}
                                                    maxLength="1"
                                                    value={code[index]}
                                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                                    required
                                                />
                                            ))}
                                        </div>

                                        <div className="text-center mb-4">
                                            <button type="button" className="btn btn-link text-primary small">
                                                <i className="fas fa-redo-alt me-1"></i>
                                                Renvoyer le code
                                            </button>
                                        </div>

                                        <button 
                                            type="submit" 
                                            className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-3"
                                            disabled={isLoading || code.some(d => !d)}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Vérification...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-check me-2"></i>
                                                    Vérifier le code
                                                </>
                                            )}
                                        </button>

                                        <div className="text-center">
                                            <button 
                                                type="button" 
                                                className="btn btn-link text-primary small"
                                                onClick={() => setStep(1)}
                                            >
                                                <i className="fas fa-arrow-left me-1"></i>
                                                Modifier l'email
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Étape 3: Nouveau mot de passe */}
                                {step === 3 && (
                                    <form onSubmit={handleResetPassword}>
                                        <h4 className="fw-bold text-center mb-4">Nouveau mot de passe</h4>
                                        <p className="text-muted text-center mb-4">
                                            Choisissez un nouveau mot de passe sécurisé
                                        </p>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Nouveau mot de passe</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-lock text-primary"></i>
                                                </span>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control border-start-0 ps-0"
                                                    placeholder="••••••••"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-semibold">Confirmer le mot de passe</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-lock text-primary"></i>
                                                </span>
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="form-control border-start-0 ps-0"
                                                    placeholder="••••••••"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Indicateur de force du mot de passe */}
                                        {newPassword && (
                                            <div className="mb-4">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small className="text-muted">Force du mot de passe</small>
                                                    <small className={`fw-bold ${
                                                        newPassword.length < 6 ? 'text-danger' :
                                                        newPassword.length < 10 ? 'text-warning' : 'text-success'
                                                    }`}>
                                                        {newPassword.length < 6 ? 'Faible' :
                                                         newPassword.length < 10 ? 'Moyen' : 'Fort'}
                                                    </small>
                                                </div>
                                                <div className="progress" style={{ height: '5px' }}>
                                                    <div 
                                                        className={`progress-bar ${
                                                            newPassword.length < 6 ? 'bg-danger' :
                                                            newPassword.length < 10 ? 'bg-warning' : 'bg-success'
                                                        }`} 
                                                        style={{ width: `${Math.min((newPassword.length / 15) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <small className="text-muted">
                                                    Minimum 6 caractères
                                                </small>
                                            </div>
                                        )}

                                        <button 
                                            type="submit" 
                                            className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-3"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Réinitialisation...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Réinitialiser le mot de passe
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
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

            {/* Styles additionnels */}
            <style jsx>{`
                input[type="text"]:focus, input[type="password"]:focus, input[type="email"]:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1);
                }
                
                .progress-bar {
                    transition: width 0.3s ease;
                }
            `}</style>
        </div>
    );
}