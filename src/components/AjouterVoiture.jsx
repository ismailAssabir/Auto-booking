import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addCar } from '../features/cars/carsSlice';

const AjouterVoiture = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Récupération des voitures pour générer un ID unique
  const allCars = useSelector((state) => state.cars.cars) || [];

  const [formData, setFormData] = useState({
    name: '',
    pricePerDay: '',
    transmission: 'Automatique',
    seats: 5,
    status: 'available',
    image: ''
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Conversion automatique en nombre pour les champs numériques
    const val = (name === 'pricePerDay' || name === 'seats') ? Number(value) : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.image) {
      alert("Veuillez ajouter une photo du véhicule");
      return;
    }

    // Calcul de l'ID (Max ID + 1)
    const newId = allCars.length > 0 
      ? Math.max(...allCars.map(c => c.id)) + 1 
      : 1;

    // Dispatch de l'objet complet avec l'ID
    dispatch(addCar({ ...formData, id: newId }));
    
    alert("Véhicule ajouté avec succès !");
    navigate('/gestionVoitures');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-header bg-primary text-white py-3 rounded-top-4">
              <h4 className="mb-0 text-center fw-bold">Ajouter un nouveau véhicule</h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                
                {/* Zone d'upload d'image */}
                <div className="mb-4 text-center">
                  <div 
                    className="mx-auto mb-3 border d-flex align-items-center justify-content-center rounded-3 bg-light"
                    style={{ width: '100%', height: '200px', overflow: 'hidden', position: 'relative' }}
                  >
                    {preview ? (
                      <img src={preview} alt="Aperçu" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="text-muted text-center">
                        <span className="display-4 d-block">📷</span>
                        <p className="small mb-0">Aucune photo sélectionnée</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    id="carImage" 
                    className="d-none" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  <label htmlFor="carImage" className="btn btn-outline-primary btn-sm rounded-pill px-4">
                    Choisir une photo
                  </label>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-uppercase">Nom du modèle</label>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Ex: Dacia Logan"
                    className="form-control" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold small text-uppercase">Prix / Jour (MAD)</label>
                    <input 
                      type="number" 
                      name="pricePerDay"
                      className="form-control" 
                      value={formData.pricePerDay}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold small text-uppercase">Places</label>
                    <input 
                      type="number" 
                      name="seats"
                      className="form-control" 
                      value={formData.seats}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-uppercase">Transmission</label>
                  <select 
                    name="transmission" 
                    className="form-select" 
                    value={formData.transmission}
                    onChange={handleChange}
                  >
                    <option value="Automatique">Automatique</option>
                    <option value="Manuelle">Manuelle</option>
                  </select>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-primary fw-bold py-2 shadow-sm">
                    Enregistrer le véhicule
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-light fw-bold" 
                    onClick={() => navigate('/gestionVoitures')}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjouterVoiture;