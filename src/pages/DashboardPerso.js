import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { updateUser, deleteUser } from "../features/user/userSlice";
import { deconnecter } from "../features/auth/authSlice";
import { deleteContact, replyToContact } from "../features/contact/contactsSlice";

const DashboardPerso = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.user);
  const allUsers = useSelector((state) => state.users.users) || [];
  const allReservations = useSelector((state) => state.reservations.reservations) || [];
  const allCars = useSelector((state) => state.cars.cars) || [];
  const contacts = useSelector((state) => state.contacts?.contacts) || [];
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!(currentUser.role === "employee" || currentUser.role === "employe")) {
      if (currentUser.role === "client") {
        navigate("/dashboard/client");
      } else if (currentUser.role === "admin") {
        navigate("/dashboard/chef");
      } else {
        navigate("/login");
      }
    }
  }, [currentUser, navigate]);

  const [activeTab, setActiveTab] = useState("reservations");
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [previewAvatar, setPreviewAvatar] = useState(currentUser?.avatar || "");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, msg: "", type: "" });
  const [isEditing, setIsEditing] = useState(false);
  
  // États pour la gestion des contacts
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("all");

  // Formatage automatique du numéro de téléphone
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 7) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const getCarDetails = (carId) =>
    allCars.find((car) => Number(car.id) === Number(carId));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, image: "L'image ne doit pas dépasser 5MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
        setFormErrors({ ...formErrors, image: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    const phoneDigits = phone.replace(/\D/g, '');
    
    if (phoneDigits.length !== 10 && phoneDigits.length > 0) {
      errors.phone = "Le numéro doit contenir 10 chiffres";
    }
    
    if (password && password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (!validateForm()) return;

    const updatedUser = {
      id: currentUser.id,
      name: name,
      phone: phone,
      avatar: previewAvatar,
      ...(password && { password: password })
    };

    dispatch(updateUser(updatedUser));

    setAlert({ 
      show: true, 
      msg: "✅ Profil mis à jour avec succès !", 
      type: "success" 
    });
    setPassword("");
    setIsEditing(false);
    setTimeout(() => setAlert({ show: false, msg: "", type: "" }), 3000);
  };

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vous déconnecter ?")) {
      dispatch(deconnecter());
      navigate("/login");
    }
  };

  const handleCancel = () => {
    setName(currentUser?.name || "");
    setPhone(currentUser?.phone || "");
    setPreviewAvatar(currentUser?.avatar || "");
    setPassword("");
    setFormErrors({});
    setIsEditing(false);
  };

  // Fonctions pour la gestion des contacts
  const handleDeleteContact = (contactId) => {
    if (window.confirm("Supprimer définitivement ce message ?")) {
      dispatch(deleteContact(contactId));
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
      setAlert({ 
        show: true, 
        msg: "✅ Message supprimé avec succès", 
        type: "success" 
      });
      setTimeout(() => setAlert({ show: false, msg: "", type: "" }), 3000);
    }
  };

  const handleReply = (contact) => {
    if (replyText.trim()) {
      dispatch(replyToContact({ 
        contactId: contact.id, 
        reply: replyText 
      }));
      
      setReplyText("");
      setAlert({ 
        show: true, 
        msg: "✅ Réponse envoyée avec succès !", 
        type: "success" 
      });
      setTimeout(() => setAlert({ show: false, msg: "", type: "" }), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrage des contacts
  const filteredContacts = contacts.filter(contact => {
    if (filter === 'all') return true;
    return contact.status === filter;
  });

  const unreadCount = contacts.filter(c => c.status === 'non lu').length;

  if (!currentUser) return null;

  // Statistiques pour l'employé
  const pendingInspections = allReservations.filter(r => r.status === "pending").length;
  const activeReservations = allReservations.filter(r => r.status === "confirmed").length;
  const completedToday = allReservations.filter(r => r.status === "completed").length;

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      {/* ALERT SYSTEM */}
      {alert.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-lg border-0 rounded-3`} role="alert">
            <div className="d-flex align-items-center">
              <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2 fs-5`}></i>
              {alert.msg}
            </div>
            <button type="button" className="btn-close" onClick={() => setAlert({ ...alert, show: false })}></button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-4 shadow-sm">
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
              <i className="fas fa-user-tie text-primary fs-3"></i>
            </div>
            <div>
              <h2 className="fw-bold mb-0">Espace Personnel</h2>
              <p className="text-muted mb-0">Gérez vos tâches et votre profil</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-md-block">
              <p className="mb-0 fw-bold">{currentUser?.name}</p>
              <small className="text-muted text-capitalize">{currentUser?.role}</small>
            </div>
            <img
              src={currentUser?.avatar || 'https://via.placeholder.com/45'}
              className="rounded-circle border border-2 border-primary shadow-sm"
              style={{ width: "45px", height: "45px", objectFit: "cover" }}
              alt="avatar"
            />
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3">
              <i className="fas fa-sign-out-alt me-2"></i>
              Déconnexion
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 bg-warning bg-opacity-10">
              <div className="card-body d-flex align-items-center">
                <div className="bg-warning rounded-3 p-3 me-3">
                  <i className="fas fa-clock text-white fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Inspections en attente</h6>
                  <h3 className="fw-bold mb-0">{pendingInspections}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 bg-primary bg-opacity-10">
              <div className="card-body d-flex align-items-center">
                <div className="bg-primary rounded-3 p-3 me-3">
                  <i className="fas fa-car text-white fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Réservations actives</h6>
                  <h3 className="fw-bold mb-0">{activeReservations}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 bg-success bg-opacity-10">
              <div className="card-body d-flex align-items-center">
                <div className="bg-success rounded-3 p-3 me-3">
                  <i className="fas fa-check-circle text-white fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Terminées aujourd'hui</h6>
                  <h3 className="fw-bold mb-0">{completedToday}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-white rounded-4 shadow-sm p-2 mb-4">
          <div className="d-flex gap-2 flex-wrap">
            <button 
              className={`btn ${activeTab === "reservations" ? 'btn-primary' : 'btn-light'} rounded-pill px-4`}
              onClick={() => setActiveTab("reservations")}
            >
              <i className="fas fa-calendar-alt me-2"></i>
              Réservations
            </button>
            <button 
              className={`btn ${activeTab === "users" ? 'btn-primary' : 'btn-light'} rounded-pill px-4`}
              onClick={() => setActiveTab("users")}
            >
              <i className="fas fa-users me-2"></i>
              Liste Clients
            </button>
            <button 
              className={`btn ${activeTab === "contacts" ? 'btn-primary' : 'btn-light'} rounded-pill px-4 position-relative`}
              onClick={() => setActiveTab("contacts")}
            >
              <i className="fas fa-envelope me-2"></i>
              Messages
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              className={`btn ${activeTab === "profile" ? 'btn-primary' : 'btn-light'} rounded-pill px-4`}
              onClick={() => setActiveTab("profile")}
            >
              <i className="fas fa-user me-2"></i>
              Mon Profil
            </button>
          </div>
        </div>

        {/* TAB CONTENT: RESERVATIONS */}
        {activeTab === "reservations" && (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 p-4">
              <h5 className="fw-bold mb-0">
                <i className="fas fa-list me-2 text-primary"></i>
                Liste des réservations
              </h5>
            </div>
            <div className="table-responsive px-4 pb-4">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Véhicule</th>
                    <th>Dates</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allReservations.filter(res => res.status !== "completed").map((res) => {
                    const car = getCarDetails(res.carId);
                    return (
                      <tr key={res.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={car?.image || 'https://via.placeholder.com/40'} 
                              className="rounded-circle me-2" 
                              style={{ width: "40px", height: "40px", objectFit: "cover" }} 
                              alt={car?.name}
                            />
                            <div>
                              <div className="fw-bold">{car?.name || "Véhicule supprimé"}</div>
                              <small className="text-muted">{car?.transmission} • {car?.seats} places</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            <i className="fas fa-calendar me-1"></i>
                            {res.startDate} au {res.endDate}
                          </small>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${
                            res.status === "pending" ? "bg-warning" : 
                            res.status === "confirmed" ? "bg-success" : "bg-secondary"
                          }`}>
                            {res.status === "pending" ? "En attente" : 
                             res.status === "confirmed" ? "Confirmée" : "Terminée"}
                          </span>
                        </td>
                        <td>
                          {res.status === "pending" && (
                            <Link to={`/inspectionVoiture/${res.id}`} className="btn btn-sm btn-warning rounded-pill px-3">
                              <i className="fas fa-clipboard-check me-2"></i>
                              Inspecter
                            </Link>
                          )}
                          {res.status === "confirmed" && (
                            <Link to={`/retourVoiture/${res.id}`} className="btn btn-sm btn-danger rounded-pill px-3">
                              <i className="fas fa-undo-alt me-2"></i>
                              Retour
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT: LISTE CLIENTS */}
        {activeTab === "users" && (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">
                <i className="fas fa-users me-2 text-primary"></i>
                Gestion des Clients
              </h5>
              <Link to="/ajouterUser" className="btn btn-primary rounded-pill px-4">
                <i className="fas fa-plus me-2"></i>
                Nouveau Client
              </Link>
            </div>
            <div className="table-responsive px-4 pb-4">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Client</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.filter((u) => u?.role === "client").map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={u.avatar || 'https://via.placeholder.com/35'} 
                            className="rounded-circle me-2 border" 
                            style={{ width: "35px", height: "35px", objectFit: "cover" }} 
                            alt="avatar" 
                          />
                          <span className="fw-semibold">{u.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td className="text-muted">{u.phone || 'Non renseigné'}</td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <Link to={`/modifierUtilisateur/${u.id}`} className="btn btn-sm btn-warning rounded-pill px-3">
                            <i className="fas fa-edit me-2"></i>
                            Modifier
                          </Link>
                          <button 
                            className="btn btn-sm btn-outline-danger rounded-pill px-3" 
                            onClick={() => { 
                              if(window.confirm("Supprimer ce client ?")) dispatch(deleteUser(u.id)) 
                            }}
                          >
                            <i className="fas fa-trash-alt me-2"></i>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT: CONTACTS */}
        {activeTab === "contacts" && (
          <div className="row g-4">
            {/* Liste des contacts */}
            <div className="col-md-5 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Messages reçus
                    </h5>
                    <span className="badge bg-primary rounded-pill">{contacts.length}</span>
                  </div>
                  
                  {/* Filtres */}
                  <div className="d-flex gap-2 flex-wrap">
                    <button 
                      className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill`}
                      onClick={() => setFilter('all')}
                    >
                      Tous
                    </button>
                    <button 
                      className={`btn btn-sm ${filter === 'non lu' ? 'btn-warning' : 'btn-outline-warning'} rounded-pill position-relative`}
                      onClick={() => setFilter('non lu')}
                    >
                      Non lus
                      {unreadCount > 0 && (
                        <span className="badge bg-danger ms-1">{unreadCount}</span>
                      )}
                    </button>
                    <button 
                      className={`btn btn-sm ${filter === 'répondu' ? 'btn-success' : 'btn-outline-success'} rounded-pill`}
                      onClick={() => setFilter('répondu')}
                    >
                      Répondu
                    </button>
                  </div>
                </div>

                <div className="list-group list-group-flush" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="fas fa-inbox fa-3x mb-3"></i>
                      <p>Aucun message trouvé</p>
                    </div>
                  ) : (
                    filteredContacts.map(contact => (
                      <button
                        key={contact.id}
                        className={`list-group-item list-group-item-action border-0 p-3 ${selectedContact?.id === contact.id ? 'active' : ''}`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div>
                            <h6 className="mb-0 fw-bold">{contact.name}</h6>
                            <small className="text-muted">{contact.email}</small>
                          </div>
                          {contact.status === 'non lu' && (
                            <span className="badge bg-warning rounded-pill">Nouveau</span>
                          )}
                        </div>
                        <p className="mb-1 small text-truncate">{contact.subject}</p>
                        <small className="text-muted">
                          <i className="fas fa-clock me-1"></i>
                          {formatDate(contact.date)}
                        </small>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Détail du contact */}
            <div className="col-md-7 col-lg-8">
              {selectedContact ? (
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="fw-bold mb-1">{selectedContact.subject}</h5>
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(selectedContact.date)}
                      </small>
                    </div>
                    <button 
                      className="btn btn-outline-danger btn-sm rounded-pill"
                      onClick={() => handleDeleteContact(selectedContact.id)}
                    >
                      <i className="fas fa-trash-alt me-2"></i>
                      Supprimer
                    </button>
                  </div>

                  <div className="card-body p-4">
                    {/* Informations de l'expéditeur */}
                    <div className="bg-light rounded-3 p-3 mb-4">
                      <div className="d-flex align-items-center gap-3">
                        <img 
                          src={selectedContact.avatar || 'https://via.placeholder.com/50'}
                          className="rounded-circle border"
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                          alt="avatar"
                        />
                        <div>
                          <h6 className="fw-bold mb-1">{selectedContact.name}</h6>
                          <p className="mb-0 small">
                            <i className="fas fa-envelope me-2"></i>
                            {selectedContact.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">Message :</h6>
                      <div className="bg-white border rounded-3 p-3">
                        <p className="mb-0">{selectedContact.message}</p>
                      </div>
                    </div>

                    {/* Réponses existantes */}
                    {selectedContact.replies?.length > 0 && (
                      <div className="mb-4">
                        <h6 className="fw-bold text-success mb-2">
                          <i className="fas fa-reply me-2"></i>
                          Vos réponses
                        </h6>
                        {selectedContact.replies.map(reply => (
                          <div key={reply.id} className="bg-success bg-opacity-10 rounded-3 p-3 mb-2">
                            <p className="mb-1">{reply.message}</p>
                            <small className="text-muted">
                              {formatDate(reply.date)}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulaire de réponse */}
                    {(!selectedContact.replies || selectedContact.replies.length === 0) && (
                      <div>
                        <h6 className="fw-bold mb-2">Répondre :</h6>
                        <textarea
                          className="form-control mb-3"
                          rows="4"
                          placeholder="Écrivez votre réponse..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        ></textarea>
                        <button 
                          className="btn btn-primary rounded-pill px-4"
                          onClick={() => handleReply(selectedContact)}
                          disabled={!replyText.trim()}
                        >
                          <i className="fas fa-paper-plane me-2"></i>
                          Envoyer la réponse
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                  <i className="fas fa-envelope-open-text fa-4x text-muted mb-3"></i>
                  <h5 className="text-muted">Sélectionnez un message pour voir les détails</h5>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: PROFILE */}
        {activeTab === "profile" && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="bg-primary text-white p-4">
                  <h5 className="fw-bold mb-0">
                    <i className="fas fa-user-circle me-2"></i>
                    Mon Profil
                  </h5>
                  <p className="text-white-50 small mb-0">Gérez vos informations personnelles</p>
                </div>
                
                <div className="card-body p-4">
                  <form onSubmit={handleUpdateProfile}>
                    <div className="row">
                      <div className="col-md-4 text-center mb-4 mb-md-0">
                        <div className="position-relative d-inline-block">
                          <img 
                            src={previewAvatar || 'https://via.placeholder.com/150'} 
                            className="rounded-circle border border-4 border-primary shadow" 
                            style={{ width: "150px", height: "150px", objectFit: "cover" }} 
                            alt="preview" 
                          />
                          <label 
                            htmlFor="upload-photo" 
                            className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 border border-2 border-white"
                            style={{ cursor: 'pointer' }}
                          >
                            <i className="fas fa-camera text-white"></i>
                          </label>
                          <input 
                            type="file" 
                            id="upload-photo" 
                            className="d-none" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                          />
                        </div>
                        {formErrors.image && (
                          <small className="text-danger d-block mt-2">{formErrors.image}</small>
                        )}
                      </div>

                      <div className="col-md-8">
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            <i className="fas fa-user text-primary me-2"></i>
                            Nom complet
                          </label>
                          <input 
                            type="text" 
                            className="form-control form-control-lg rounded-3" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            <i className="fas fa-phone text-primary me-2"></i>
                            Numéro de téléphone
                          </label>
                          <input 
                            type="tel" 
                            className={`form-control form-control-lg rounded-3 ${formErrors.phone ? 'is-invalid' : ''}`}
                            value={phone} 
                            onChange={handlePhoneChange}
                            placeholder="06 12 34 56 78"
                          />
                          {formErrors.phone ? (
                            <small className="text-danger">{formErrors.phone}</small>
                          ) : (
                            <small className="text-muted">Format: 06 12 34 56 78</small>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            <i className="fas fa-envelope text-primary me-2"></i>
                            Email
                          </label>
                          <input 
                            type="text" 
                            className="form-control form-control-lg rounded-3 bg-light" 
                            value={currentUser?.email || ""} 
                            disabled 
                          />
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-semibold">
                            <i className="fas fa-lock text-primary me-2"></i>
                            Nouveau mot de passe
                          </label>
                          <div className="input-group">
                            <input 
                              type={showPassword ? "text" : "password"}
                              className={`form-control form-control-lg rounded-3 ${formErrors.password ? 'is-invalid' : ''}`}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
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
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Laissez vide pour conserver le mot de passe actuel
                          </small>
                        </div>

                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary flex-grow-1 py-2 rounded-3 fw-bold">
                            <i className="fas fa-save me-2"></i>
                            Enregistrer
                          </button>
                          {isEditing && (
                            <button type="button" className="btn btn-outline-secondary px-4 rounded-3" onClick={handleCancel}>
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>

                  <hr className="my-4" />

                  <div className="row g-3">
                    <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3">
                        <small className="text-muted text-uppercase fw-bold">Rôle</small>
                        <p className="fw-bold mb-0 text-capitalize">{currentUser.role}</p>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3">
                        <small className="text-muted text-uppercase fw-bold">Membre depuis</small>
                        <p className="fw-bold mb-0">Janvier 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPerso;