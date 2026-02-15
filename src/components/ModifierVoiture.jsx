import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateCarData } from '../features/cars/carsSlice';

const ModifierVoiture = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Récupération de la voiture spécifique depuis le store
  const carToEdit = useSelector((state) => 
    state.cars.cars.find((c) => c.id === parseInt(id))
  );

  const [formData, setFormData] = useState({
    id: Number(id),
    name: '',
    pricePerDay: '',
    transmission: 'Automatique',
    seats: 5,
    status: 'available',
    image: ''
  });

    if (!carToEdit) navigate('/gestionVoitures'); 

    // Préfère ceci
    useEffect(() => {
    if (!carToEdit) navigate('/gestionVoitures');
    }, [carToEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateCarData(formData));
    alert("Véhicule mis à jour avec succès !");
    navigate('/gestionVoitures');
  };

  if (!carToEdit) return null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-header bg-dark text-white py-3 rounded-top-4">
              <h4 className="mb-0 text-center fw-bold">Modifier le véhicule</h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Aperçu de l'image actuelle */}
                <div className="text-center mb-4">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="rounded-3 shadow-sm border"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                  />
                  <div className="mt-2">
                    <label htmlFor="imageUpload" className="btn btn-sm btn-outline-primary">
                      Changer la photo
                    </label>
                    <input 
                      type="file" 
                      id="imageUpload" 
                      className="d-none" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-uppercase">Modèle du véhicule</label>
                  <input 
                    type="text" 
                    name="name"
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
                    <label className="form-label fw-bold small text-uppercase">Nombre de places</label>
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

                <div className="mb-4">
                  <label className="form-label fw-bold small text-uppercase">Statut</label>
                  <select 
                    name="status"
                    className="form-select" 
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="available">Disponible</option>
                    <option value="reserved">Réservée</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary fw-bold py-2 shadow">
                    Sauvegarder les modifications
                  </button>
                  <Link  to="/dashboard/chef"
                    type="button" 
                    className="btn btn-light fw-bold py-2"
                    
                  >
                    Annuler
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifierVoiture;