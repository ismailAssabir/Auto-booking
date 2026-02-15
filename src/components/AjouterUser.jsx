import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addUser } from '../features/user/userSlice'; // Assurez-vous d'avoir cette action

const AjouterUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {role} = useParams()
  const allUsers = useSelector((state) => state.users.users) || [];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    avatar: ''
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation de l'email unique (optionnel mais recommandé)
    const emailExists = allUsers.some(u => u.email === formData.email);
    if (emailExists) {
      alert("Cet email est déjà utilisé par un autre compte.");
      return;
    }

    // Génération automatique de l'ID
    const newId = allUsers.length > 0 ? Math.max(...allUsers.map(u => u.id)) + 1 : 1;

    dispatch(addUser({ ...formData, id: newId }));
    
    alert("Utilisateur créé avec succès !");
    role === "admin" ? navigate('/dashboard/chef'):navigate("/dashboard/personnel")
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-header bg-dark text-white py-3 rounded-top-4">
              <h4 className="mb-0 text-center fw-bold">Nouveau Profil Utilisateur</h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                
                {/* Section Avatar */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <img 
                      src={preview || 'https://via.placeholder.com/100'} 
                      alt="Avatar" 
                      className="rounded-circle border shadow-sm"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <label 
                      htmlFor="avatarUpload" 
                      className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle"
                    >
                      +
                    </label>
                    <input 
                      type="file" 
                      id="avatarUpload" 
                      className="d-none" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">NOM COMPLET</label>
                  <input 
                    type="text" 
                    name="name"
                    className="form-control rounded-3" 
                    placeholder="Jean Dupont"
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">ADRESSE EMAIL</label>
                  <input 
                    type="email" 
                    name="email"
                    className="form-control rounded-3" 
                    placeholder="exemple@agence.com"
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">MOT DE PASSE</label>
                  <input 
                    type="password" 
                    name="password"
                    className="form-control rounded-3" 
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold small">RÔLE SYSTÈME</label>
                  <select 
                    name="role" 
                    className="form-select rounded-3" 
                    onChange={handleChange}
                    value={role=== "employee"? "client": formData.role}
                    disabled={role === "employee"}
                  >
                    <option value="client">Client</option>
                    <option value="employe">Employé (Gestionnaire)</option>
                    <option value="admin">Administrateur (Chef)</option>
                  </select>
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary fw-bold py-2 shadow-sm">
                    Créer l'utilisateur
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-light fw-bold text-muted" 
                    onClick={() => navigate('/dashboard/chef')}
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

export default AjouterUser;