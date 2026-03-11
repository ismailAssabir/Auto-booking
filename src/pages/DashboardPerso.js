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
  const [searchTerm, setSearchTerm] = useState("");

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
        reply: replyText,
        date: new Date().toISOString()
      }));
      
      // Mettre à jour le contact sélectionné localement
      const updatedContact = {
        ...contact,
        replies: [...(contact.replies || []), {
          id: Date.now(),
          message: replyText,
          date: new Date().toISOString()
        }]
      };
      setSelectedContact(updatedContact);
      
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Aujourd'hui à " + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Hier à " + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Filtrage et recherche des contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesFilter = filter === 'all' || contact.status === filter;
    const matchesSearch = searchTerm === '' || 
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Tri des contacts (non lus en premier, puis par date)
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (a.status === 'non lu' && b.status !== 'non lu') return -1;
    if (a.status !== 'non lu' && b.status === 'non lu') return 1;
    return new Date(b.date) - new Date(a.date);
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
                  {allReservations.filter(res => res.status !== "confirmed").map((res) => {
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
                          <Link to={`/modifierUtilisateur/${u.id}/employee`} className="btn btn-sm btn-warning rounded-pill px-3">
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

        {/* TAB CONTENT: CONTACTS - DESIGN ALTERNATIF PROFESSIONNEL */}
        {activeTab === "contacts" && (
          <div className="row g-4">
            {/* Colonne de gauche - Liste des messages sous forme de cartes */}
            <div className="col-lg-5 col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white border-0 p-4 pb-0">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">
                      <i className="fas fa-inbox me-2 text-primary"></i>
                      Boîte de réception
                    </h5>
                    <div className="d-flex gap-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                        <i className="fas fa-envelope me-1"></i> {contacts.length}
                      </span>
                      <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2">
                        <i className="fas fa-envelope-open me-1"></i> {unreadCount} non lus
                      </span>
                    </div>
                  </div>

                  {/* Barre de recherche améliorée */}
                  <div className="position-relative mb-4">
                    <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    <input
                      type="text"
                      className="form-control rounded-pill bg-light border-0 ps-5 py-2"
                      placeholder="Rechercher par email ou sujet..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button 
                        className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted"
                        onClick={() => setSearchTerm("")}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>

                  {/* Filtres sous forme de badges cliquables */}
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span 
                      className={`badge ${filter === 'all' ? 'bg-primary' : 'bg-light text-dark'} rounded-pill px-3 py-2 cursor-pointer`}
                      onClick={() => setFilter('all')}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fas fa-stream me-1"></i> Tous
                    </span>
                    <span 
                      className={`badge ${filter === 'non lu' ? 'bg-warning' : 'bg-light text-dark'} rounded-pill px-3 py-2 cursor-pointer position-relative`}
                      onClick={() => setFilter('non lu')}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fas fa-circle me-1"></i> Non lus
                      {unreadCount > 0 && filter !== 'non lu' && (
                        <span className="badge bg-danger rounded-pill ms-1">{unreadCount}</span>
                      )}
                    </span>
                    <span 
                      className={`badge ${filter === 'répondu' ? 'bg-success' : 'bg-light text-dark'} rounded-pill px-3 py-2 cursor-pointer`}
                      onClick={() => setFilter('répondu')}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fas fa-check-circle me-1"></i> Répondu
                    </span>
                  </div>
                </div>

                <div className="card-body p-3" style={{ maxHeight: '650px', overflowY: 'auto' }}>
                  {sortedContacts.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                        <i className="fas fa-inbox fa-3x text-muted"></i>
                      </div>
                      <h6 className="text-muted">Aucun message trouvé</h6>
                      <p className="text-muted small">Essayez de modifier vos filtres de recherche</p>
                    </div>
                  ) : (
                    <div className="vstack gap-2">
                      {sortedContacts.map(contact => (
                        <div
                          key={contact.id}
                          className={`card border-0 rounded-3 ${selectedContact?.id === contact.id ? 'bg-primary text-white' : 'bg-light'} cursor-pointer`}
                          onClick={() => setSelectedContact(contact)}
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <div className={`rounded-circle d-flex align-items-center justify-content-center ${selectedContact?.id === contact.id ? 'bg-white' : 'bg-primary'} bg-opacity-10`} 
                                     style={{ width: '40px', height: '40px' }}>
                                  <i className={`fas fa-user ${selectedContact?.id === contact.id ? 'text-primary' : 'text-primary'}`}></i>
                                </div>
                                <div>
                                  <h6 className={`mb-0 fw-semibold ${selectedContact?.id === contact.id ? 'text-white' : ''}`}>
                                    {contact.email}
                                  </h6>
                                  <small className={selectedContact?.id === contact.id ? 'text-white-50' : 'text-muted'}>
                                    {formatDate(contact.date)}
                                  </small>
                                </div>
                              </div>
                              {contact.status === 'non lu' && (
                                <span className="badge bg-warning rounded-pill px-2">Nouveau</span>
                              )}
                            </div>
                            
                            <p className={`mb-0 small ${selectedContact?.id === contact.id ? 'text-white' : 'text-muted'}`}>
                              <i className="fas fa-tag me-1"></i>
                              <strong>{contact.subject}</strong>
                            </p>
                            
                            <p className={`mb-0 small text-truncate mt-1 ${selectedContact?.id === contact.id ? 'text-white-50' : ''}`}>
                              {contact.message.substring(0, 80)}...
                            </p>

                            {contact.replies?.length > 0 && (
                              <div className="mt-2">
                                <small className={selectedContact?.id === contact.id ? 'text-white-50' : 'text-success'}>
                                  <i className="fas fa-reply me-1"></i>
                                  {contact.replies.length} réponse(s)
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne de droite - Vue détaillée du message */}
            <div className="col-lg-7 col-xl-8">
              {selectedContact ? (
                <div className="card border-0 shadow-sm rounded-4">
                  {/* En-tête du message */}
                  <div className="card-header bg-white border-0 p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4 className="fw-bold mb-2">{selectedContact.subject}</h4>
                        <div className="d-flex flex-wrap gap-3 align-items-center">
                          <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                            <i className="fas fa-clock me-1 text-primary"></i>
                            {formatDate(selectedContact.date)}
                          </span>
                          <span className={`badge rounded-pill px-3 py-2 ${
                            selectedContact.status === 'non lu' ? 'bg-warning' : 
                            selectedContact.status === 'répondu' ? 'bg-success' : 'bg-secondary'
                          }`}>
                            <i className={`fas me-1 ${
                              selectedContact.status === 'non lu' ? 'fa-circle' : 
                              selectedContact.status === 'répondu' ? 'fa-check-circle' : 'fa-check'
                            }`}></i>
                            {selectedContact.status === 'non lu' ? 'Non lu' : 
                             selectedContact.status === 'répondu' ? 'Répondu' : 'Lu'}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                        onClick={() => handleDeleteContact(selectedContact.id)}
                      >
                        <i className="fas fa-trash-alt me-2"></i>
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div className="card-body p-4 pt-0">
                    {/* Carte d'identité de l'expéditeur */}
                    <div className="bg-light rounded-4 p-4 mb-4">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{ width: '60px', height: '60px' }}>
                              <i className="fas fa-user-circle fa-2x text-primary"></i>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-1">{selectedContact.name}</h5>
                              <p className="text-muted mb-0 small">
                                <i className="fas fa-envelope me-2"></i>
                                {selectedContact.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          {selectedContact.phone && (
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                                   style={{ width: '60px', height: '60px' }}>
                                <i className="fas fa-phone fa-2x text-success"></i>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1">Téléphone</h6>
                                <p className="text-muted mb-0">{selectedContact.phone}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Corps du message */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <i className="fas fa-comment-dots text-primary fs-5"></i>
                        <h6 className="fw-bold mb-0">Message</h6>
                      </div>
                      <div className="bg-white border rounded-4 p-4">
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                          {selectedContact.message}
                        </p>
                      </div>
                    </div>

                    {/* Historique des réponses */}
                    {selectedContact.replies?.length > 0 && (
                      <div className="mb-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="fas fa-history text-success fs-5"></i>
                          <h6 className="fw-bold mb-0 text-success">Historique des réponses</h6>
                        </div>
                        <div className="vstack gap-3">
                          {selectedContact.replies.map((reply, index) => (
                            <div key={reply.id || index} className="bg-success bg-opacity-10 rounded-4 p-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" 
                                       style={{ width: '30px', height: '30px' }}>
                                    <i className="fas fa-user-tie text-white fa-xs"></i>
                                  </div>
                                  <strong className="text-success">Vous</strong>
                                </div>
                                <small className="text-muted">
                                  <i className="fas fa-clock me-1"></i>
                                  {formatDate(reply.date)}
                                </small>
                              </div>
                              <p className="mb-0 ms-4">{reply.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formulaire de réponse */}
                    <div className="mt-4">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <i className="fas fa-reply text-primary fs-5"></i>
                        <h6 className="fw-bold mb-0">Répondre à ce message</h6>
                      </div>
                      <div className="bg-light rounded-4 p-4">
                        <textarea
                          className="form-control border-0 bg-white mb-3"
                          rows="4"
                          placeholder="Écrivez votre réponse ici..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          style={{ resize: 'vertical' }}
                        ></textarea>
                        <div className="d-flex gap-2 justify-content-end">
                          <button 
                            className="btn btn-outline-secondary rounded-pill px-4"
                            onClick={() => setReplyText("")}
                            disabled={!replyText.trim()}
                          >
                            <i className="fas fa-times me-2"></i>
                            Effacer
                          </button>
                          <button 
                            className="btn btn-primary rounded-pill px-4"
                            onClick={() => handleReply(selectedContact)}
                            disabled={!replyText.trim()}
                          >
                            <i className="fas fa-paper-plane me-2"></i>
                            Envoyer la réponse
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex flex-column align-items-center justify-content-center p-5" style={{ minHeight: '500px' }}>
                    <div className="bg-light rounded-circle d-inline-flex p-5 mb-4">
                      <i className="fas fa-envelope-open-text fa-4x text-primary"></i>
                    </div>
                    <h4 className="text-muted mb-2">Aucun message sélectionné</h4>
                    <p className="text-muted text-center mb-0">
                      Cliquez sur un message dans la liste de gauche<br />
                      pour voir son contenu et y répondre
                    </p>
                  </div>
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
                <div className="bg-gradient-primary text-white p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
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
                            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
                        <p className="text-muted small mt-2">Cliquez sur l'icône pour changer</p>
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
                            Enregistrer les modifications
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
                        <p className="fw-bold mb-0 text-capitalize d-flex align-items-center">
                          <i className="fas fa-briefcase me-2 text-primary"></i>
                          {currentUser.role}
                        </p>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3">
                        <small className="text-muted text-uppercase fw-bold">Membre depuis</small>
                        <p className="fw-bold mb-0 d-flex align-items-center">
                          <i className="fas fa-calendar-alt me-2 text-primary"></i>
                          {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styles supplémentaires */}
      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .card {
          transition: all 0.3s ease;
        }
        .card:hover {
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
        .btn {
          transition: all 0.3s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        textarea.form-control {
          resize: vertical;
          min-height: 120px;
        }
        textarea.form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          border-color: #667eea;
        }
        .bg-success.bg-opacity-10 {
          background-color: rgba(40, 167, 69, 0.1) !important;
        }
        .bg-primary.bg-opacity-10 {
          background-color: rgba(102, 126, 234, 0.1) !important;
        }
        .bg-warning.bg-opacity-10 {
          background-color: rgba(255, 193, 7, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default DashboardPerso;