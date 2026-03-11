import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function FormUser({ data, handleSubmit, btnText, isLoading }) {
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(data.avatar || null);
    const [formErrors, setFormErrors] = useState({});
    
    const isEditMode = btnText === "Modifier";
    const isRegisterMode = btnText === "Inscrire";
    
    // Validation du formulaire
    const validateForm = (e) => {
        const form = e.target;
        const phone = form.phone?.value;
        const password = form.pass?.value;
        const errors = {};

        // Validation du téléphone (10 chiffres)
        if (phone) {
            const phoneDigits = phone.replace(/\D/g, '');
            if (phoneDigits.length !== 10) {
                errors.phone = "Le numéro doit contenir 10 chiffres";
            }
        }

        // Validation du mot de passe (si fourni)
        if (password && password.length < 6 && isEditMode) {
            errors.password = "Le mot de passe doit contenir au moins 6 caractères";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (validateForm(e)) {
            handleSubmit(e);
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
                setFormErrors({ ...formErrors, image: null });
            };
            reader.readAsDataURL(file);
        }
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
        e.target.value = formatted;
    };

    return (
        <div className="card border-0 shadow rounded-4">
            <div className="card-body p-4 p-lg-5">
                
                {/* Bouton retour pour le mode inscription - Positionné en haut à gauche */}
                {isRegisterMode && (
                    <div className="mb-4">
                        <Link 
                            to="/" 
                            className="text-decoration-none text-secondary d-inline-flex align-items-center"
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            <span>Retour à l'accueil</span>
                        </Link>
                    </div>
                )}

                {/* Aperçu de l'image */}
                <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                        <div className="rounded-circle bg-light border border-3 border-primary shadow"
                             style={{ width: '100px', height: '100px', overflow: 'hidden' }}>
                            {previewImage ? (
                                <img src={previewImage} alt="Avatar" className="w-100 h-100" 
                                     style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                                    <i className="fas fa-user-circle fa-4x text-primary"></i>
                                </div>
                            )}
                        </div>
                        
                        {isEditMode && (
                            <label className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 border border-2 border-white"
                                   style={{ cursor: 'pointer' }}>
                                <i className="fas fa-camera text-white small"></i>
                                <input type="file" name="image" className="d-none" accept="image/*" 
                                       onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                    {formErrors.image && (
                        <small className="text-danger d-block mt-2">{formErrors.image}</small>
                    )}
                </div>

                <form onSubmit={onSubmit}>
                    {/* Nom */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            <i className="fas fa-user text-primary me-2"></i>
                            Nom complet
                        </label>
                        <input 
                            type="text" 
                            name="nom" 
                            defaultValue={data.name} 
                            className="form-control form-control-lg" 
                            placeholder="Jean Dupont"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            <i className="fas fa-envelope text-primary me-2"></i>
                            Email
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            defaultValue={data.email} 
                            className="form-control form-control-lg" 
                            placeholder="exemple@email.com"
                            required
                        />
                    </div>

                    {/* Téléphone */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            <i className="fas fa-phone text-primary me-2"></i>
                            Numéro de téléphone
                        </label>
                        <input 
                            type="tel" 
                            name="phone" 
                            defaultValue={data.phone} 
                            className={`form-control form-control-lg ${formErrors.phone ? 'is-invalid' : ''}`}
                            placeholder="06 12 34 56 78"
                            onChange={handlePhoneChange}
                        />
                        {formErrors.phone ? (
                            <div className="text-danger small mt-1">
                                <i className="fas fa-exclamation-circle me-1"></i>
                                {formErrors.phone}
                            </div>
                        ) : (
                            <small className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>
                                Format: 06 12 34 56 78
                            </small>
                        )}
                    </div> 

                    {/* Mot de passe (optionnel en mode édition) */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold">
                            <i className="fas fa-lock text-primary me-2"></i>
                            {isEditMode ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                        </label>
                        <div className="input-group">
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="pass" 
                                defaultValue={data.password}
                                className={`form-control form-control-lg ${formErrors.password ? 'is-invalid' : ''}`}
                                placeholder="••••••••" 
                                required={isRegisterMode}
                                minLength={isRegisterMode ? 6 : undefined}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        {formErrors.password && (
                            <small className="text-danger">{formErrors.password}</small>
                        )}
                        {isEditMode && (
                            <small className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>
                                Laissez vide pour conserver le mot de passe actuel
                            </small>
                        )}
                    </div>

                    {/* Bouton de soumission */}
                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-3 fw-bold rounded-3"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                {isEditMode ? 'Modification' : 'Inscription'} en cours...
                            </>
                        ) : (
                            <>
                                <i className={`fas ${isEditMode ? 'fa-save' : 'fa-user-plus'} me-2`}></i>
                                {btnText}
                            </>
                        )}
                    </button>

                    {/* Lien pour l'inscription */}
                    {isRegisterMode && (
                        <div className="text-center mt-4">
                            <p className="text-muted mb-0">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="text-primary fw-bold text-decoration-none">
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}