import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InspectionForm = ({
  title,
  buttonText,
  onSubmit,
  initialData = {},
  showBackButton = true
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fuelLevel: initialData.fuelLevel || 50,
    kilometrage: initialData.kilometrage || "",
    notes: initialData.notes || "",
    exteriorCondition: initialData.exteriorCondition || "good",
    interiorCondition: initialData.interiorCondition || "good",
    tiresCondition: initialData.tiresCondition || "good",
    damages: initialData.damages || [],
    photos: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const validateStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.kilometrage) {
        newErrors.kilometrage = "Le kilométrage est requis";
      } else if (formData.kilometrage < 0) {
        newErrors.kilometrage = "Le kilométrage ne peut pas être négatif";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      onSubmit(formData);
    }
  };

  const handleDamageToggle = (damage) => {
    setFormData(prev => ({
      ...prev,
      damages: prev.damages.includes(damage)
        ? prev.damages.filter(d => d !== damage)
        : [...prev.damages, damage]
    }));
  };

  const getFuelLevelColor = (level) => {
    if (level < 20) return "danger";
    if (level < 50) return "warning";
    return "success";
  };

  return (
    <div className="container py-5">
      {/* Header avec progression */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary mb-3">
          <i className="fas fa-clipboard-check me-3"></i>
          {title}
        </h1>
        <p className="text-muted">Inspection complète du véhicule en 3 étapes</p>
      </div>

      {/* Progress Steps */}
      <div className="d-flex justify-content-center mb-5">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="text-center mx-2">
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 
                  ${currentStep >= step ? 'bg-primary text-white' : 'bg-light border'}`}
                style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}
              >
                {currentStep > step ? <i className="fas fa-check"></i> : step}
              </div>
              <small className={`${currentStep >= step ? 'text-primary fw-bold' : 'text-muted'}`}>
                {step === 1 ? 'État général' : step === 2 ? 'Détails' : 'Commentaires'}
              </small>
            </div>
            {step < 3 && (
              <div 
                className="align-self-center" 
                style={{ 
                  width: '80px', 
                  height: '2px', 
                  background: currentStep > step ? '#0d6efd' : '#dee2e6'
                }}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-5">
              <form onSubmit={handleSubmit}>
                {/* ÉTAPE 1 : ÉTAT GÉNÉRAL */}
                {currentStep === 1 && (
                  <div className="animate__animated animate__fadeIn">
                    <h4 className="fw-bold mb-4">
                      <i className="fas fa-gas-pump text-primary me-2"></i>
                      Niveau de carburant
                    </h4>
                    
                    <div className="mb-5">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-semibold">Niveau actuel</span>
                        <span className={`badge bg-${getFuelLevelColor(formData.fuelLevel)} px-3 py-2`}>
                          {formData.fuelLevel}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        className="form-range"
                        value={formData.fuelLevel}
                        onChange={(e) =>
                          setFormData({ ...formData, fuelLevel: parseInt(e.target.value) })
                        }
                      />
                      <div className="d-flex justify-content-between text-muted small mt-1">
                        <span>Vide</span>
                        <span>1/4</span>
                        <span>1/2</span>
                        <span>3/4</span>
                        <span>Plein</span>
                      </div>
                    </div>

                    <h4 className="fw-bold mb-4">
                      <i className="fas fa-tachometer-alt text-primary me-2"></i>
                      Kilométrage
                    </h4>
                    
                    <div className="mb-4">
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="fas fa-road text-primary"></i>
                        </span>
                        <input
                          type="number"
                          className={`form-control border-start-0 ${errors.kilometrage ? 'is-invalid' : ''}`}
                          placeholder="Ex: 25000"
                          value={formData.kilometrage}
                          onChange={(e) =>
                            setFormData({ ...formData, kilometrage: e.target.value })
                          }
                          required
                        />
                        <span className="input-group-text bg-light">km</span>
                      </div>
                      {errors.kilometrage && (
                        <small className="text-danger mt-1 d-block">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors.kilometrage}
                        </small>
                      )}
                    </div>
                  </div>
                )}

                {/* ÉTAPE 2 : DÉTAILS DE L'ÉTAT */}
                {currentStep === 2 && (
                  <div className="animate__animated animate__fadeIn">
                    <h4 className="fw-bold mb-4">
                      <i className="fas fa-car text-primary me-2"></i>
                      État du véhicule
                    </h4>

                    {/* État extérieur */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">État extérieur</label>
                      <div className="d-flex gap-3 flex-wrap">
                        {[
                          { value: 'excellent', label: 'Excellent', icon: 'star' },
                          { value: 'good', label: 'Bon', icon: 'thumbs-up' },
                          { value: 'fair', label: 'Moyen', icon: 'meh' },
                          { value: 'poor', label: 'Mauvais', icon: 'frown' }
                        ].map(option => (
                          <div key={option.value} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="exteriorCondition"
                              id={`exterior-${option.value}`}
                              value={option.value}
                              checked={formData.exteriorCondition === option.value}
                              onChange={(e) => setFormData({ ...formData, exteriorCondition: e.target.value })}
                            />
                            <label className="form-check-label" htmlFor={`exterior-${option.value}`}>
                              <i className={`fas fa-${option.icon} me-1`}></i>
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* État intérieur */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">État intérieur</label>
                      <div className="d-flex gap-3 flex-wrap">
                        {[
                          { value: 'excellent', label: 'Excellent', icon: 'star' },
                          { value: 'good', label: 'Bon', icon: 'thumbs-up' },
                          { value: 'fair', label: 'Moyen', icon: 'meh' },
                          { value: 'poor', label: 'Mauvais', icon: 'frown' }
                        ].map(option => (
                          <div key={option.value} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="interiorCondition"
                              id={`interior-${option.value}`}
                              value={option.value}
                              checked={formData.interiorCondition === option.value}
                              onChange={(e) => setFormData({ ...formData, interiorCondition: e.target.value })}
                            />
                            <label className="form-check-label" htmlFor={`interior-${option.value}`}>
                              <i className={`fas fa-${option.icon} me-1`}></i>
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* État des pneus */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">État des pneus</label>
                      <div className="d-flex gap-3 flex-wrap">
                        {[
                          { value: 'excellent', label: 'Neufs', icon: 'star' },
                          { value: 'good', label: 'Bon état', icon: 'thumbs-up' },
                          { value: 'fair', label: 'Usure moyenne', icon: 'meh' },
                          { value: 'poor', label: 'À changer', icon: 'exclamation-triangle' }
                        ].map(option => (
                          <div key={option.value} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="tiresCondition"
                              id={`tires-${option.value}`}
                              value={option.value}
                              checked={formData.tiresCondition === option.value}
                              onChange={(e) => setFormData({ ...formData, tiresCondition: e.target.value })}
                            />
                            <label className="form-check-label" htmlFor={`tires-${option.value}`}>
                              <i className={`fas fa-${option.icon} me-1`}></i>
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dégâts constatés */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Dégâts constatés</label>
                      <div className="row g-2">
                        {[
                          'Rayures', 'Bosselures', 'Pare-brise fissuré',
                          'Rétroviseur cassé', 'Pneu crevé', 'Problème moteur',
                          'Problème freins', 'Problème éclairage'
                        ].map(damage => (
                          <div key={damage} className="col-md-6">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`damage-${damage}`}
                                checked={formData.damages.includes(damage)}
                                onChange={() => handleDamageToggle(damage)}
                              />
                              <label className="form-check-label" htmlFor={`damage-${damage}`}>
                                {damage}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 3 : NOTES ET PHOTOS */}
                {currentStep === 3 && (
                  <div className="animate__animated animate__fadeIn">
                    <h4 className="fw-bold mb-4">
                      <i className="fas fa-comment text-primary me-2"></i>
                      Commentaires supplémentaires
                    </h4>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Notes d'inspection</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        placeholder="Décrivez l'état général du véhicule, les points d'attention particuliers..."
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                      ></textarea>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-camera text-primary me-2"></i>
                        Photos (optionnel)
                      </label>
                      <div className="border rounded-3 p-4 text-center bg-light">
                        <i className="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
                        <p className="mb-2">Glissez-déposez vos photos ici ou</p>
                        <label className="btn btn-outline-primary rounded-pill px-4">
                          <i className="fas fa-folder-open me-2"></i>
                          Parcourir
                          <input
                            type="file"
                            className="d-none"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              setFormData({ ...formData, photos: [...formData.photos, ...files] });
                            }}
                          />
                        </label>
                        {formData.photos.length > 0 && (
                          <div className="mt-3">
                            <small className="text-success">
                              <i className="fas fa-check-circle me-1"></i>
                              {formData.photos.length} photo(s) sélectionnée(s)
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Boutons de navigation */}
                <div className="d-flex justify-content-between mt-5">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="btn btn-outline-secondary rounded-pill px-5 py-2"
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Précédent
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn btn-primary rounded-pill px-5 py-2"
                    >
                      Suivant
                      <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-success rounded-pill px-5 py-2 fw-bold"
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      {buttonText}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Bouton retour */}
          {showBackButton && (
            <div className="text-center mt-4">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-link text-primary text-decoration-none"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Retour
              </button>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default InspectionForm;