import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { deconnecter } from '../features/auth/authSlice';
import { deleteUser } from '../features/user/userSlice';
import { deleteContact, replyToContact } from '../features/contact/contactsSlice';

const DashboardChef = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'cars', 'contacts'
  
  // États pour la gestion des contacts
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [contactFilter, setContactFilter] = useState("all");
  const [alert, setAlert] = useState({ show: false, msg: "", type: "" });

  const allReservations = useSelector(state => state.reservations?.reservations) || [];
  const allCars = useSelector(state => state.cars?.cars) || [];
  const allUsers = useSelector(state => state.users?.users) || [];
  const currentUser = useSelector(state => state.auth?.user);
  const contacts = useSelector(state => state.contacts?.contacts) || [];
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (currentUser.role !== "admin") {
      if (currentUser.role === "client") {
        navigate("/dashboard/client");
      } else if (currentUser.role === "employee" || currentUser.role === "employe") {
        navigate("/dashboard/personnel");
      } else {
        navigate("/login");
      }
    }
  }, [currentUser, navigate]);

  const filteredUsers = activeFilter === 'all' 
    ? allUsers 
    : allUsers.filter(u => u.role === activeFilter);

  const totalRevenue = allReservations
    .filter(res => res.status === 'confirmed')
    .reduce((acc, res) => {
      const car = allCars.find(c => c.id === res.carId);
      return acc + (car ? Number(car.pricePerDay) : 0);
    }, 0);

  const clientsCount = allUsers.filter(u => u.role === 'client').length;
  const employeesCount = allUsers.filter(u => u.role === 'employee' || u.role === 'employe').length;
  const adminsCount = allUsers.filter(u => u.role === 'admin').length;

  const stats = [
    { label: 'Chiffre d\'affaires', value: `${totalRevenue} MAD`, icon: '💰', color: 'text-success', bg: 'bg-success-subtle' },
    { label: 'Réservations', value: allReservations.length, icon: '📋', color: 'text-primary', bg: 'bg-primary-subtle' },
    { label: 'Flotte auto', value: allCars.length, icon: '🚗', color: 'text-warning', bg: 'bg-warning-subtle' },
    { label: 'Total Clients', value: clientsCount, icon: '👥', color: 'text-info', bg: 'bg-info-subtle' },
  ];

  const handleLogout = () => {
    if (window.confirm("Voulez-vous quitter la session administrateur ?")) {
      dispatch(deconnecter());
      navigate('/login');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer définitivement cet utilisateur ?")) {
      dispatch(deleteUser(id));
      setAlert({ 
        show: true, 
        msg: "✅ Utilisateur supprimé avec succès", 
        type: "success" 
      });
      setTimeout(() => setAlert({ show: false, msg: "", type: "" }), 3000);
    }
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
    if (contactFilter === 'all') return true;
    return contact.status === contactFilter;
  });

  const unreadCount = contacts.filter(c => c.status === 'non lu').length;

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      
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

      {/* HEADER PRINCIPAL */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">Dashboard Direction 📊</h2>
          <p className="text-muted small">Bienvenue, {currentUser?.name}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline-danger fw-bold rounded-pill px-4 shadow-sm">
          <i className="fas fa-sign-out-alt me-2"></i>
          Déconnexion
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="row g-3 mb-4">
        {stats.map((stat, index) => (
          <div className="col-md-3" key={index}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className={`rounded-3 p-3 me-3 ${stat.bg} ${stat.color} fs-3`}>
                  {stat.icon}
                </div>
                <div>
                  <h6 className="text-muted mb-1 small text-uppercase fw-bold">{stat.label}</h6>
                  <h4 className="fw-bold mb-0">{stat.value}</h4>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TABS DE NAVIGATION */}
      <div className="bg-white rounded-4 shadow-sm p-2 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-light'} rounded-pill px-4`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users me-2"></i>
            Utilisateurs
          </button>
          <button 
            className={`btn ${activeTab === 'cars' ? 'btn-primary' : 'btn-light'} rounded-pill px-4`}
            onClick={() => setActiveTab('cars')}
          >
            <i className="fas fa-car me-2"></i>
            Flotte Auto
          </button>
          <button 
            className={`btn ${activeTab === 'contacts' ? 'btn-primary' : 'btn-light'} rounded-pill px-4 position-relative`}
            onClick={() => setActiveTab('contacts')}
          >
            <i className="fas fa-envelope me-2"></i>
            Messages
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB CONTENT: UTILISATEURS */}
      {activeTab === 'users' && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4">
              
              {/* EN-TETE AVEC FILTRES PAR RÔLE */}
              <div className="card-header bg-white py-3 border-0">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 fw-bold text-dark">
                    <i className="fas fa-users me-2 text-primary"></i>
                    Liste des Utilisateurs
                  </h5>
                  <Link to="/ajouterUser" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm">
                    <i className="fas fa-plus me-2"></i>
                    Ajouter
                  </Link>
                </div>
                
                {/* FILTRES PAR RÔLE */}
                <div className="d-flex gap-2 flex-wrap">
                  <button 
                    className={`btn btn-sm rounded-pill px-3 fw-bold ${
                      activeFilter === 'all' 
                        ? 'btn-dark' 
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => setActiveFilter('all')}
                  >
                    Tous ({allUsers.length})
                  </button>
                  <button 
                    className={`btn btn-sm rounded-pill px-3 fw-bold ${
                      activeFilter === 'client' 
                        ? 'btn-info text-white' 
                        : 'btn-outline-info'
                    }`}
                    onClick={() => setActiveFilter('client')}
                  >
                    👤 Clients ({clientsCount})
                  </button>
                  <button 
                    className={`btn btn-sm rounded-pill px-3 fw-bold ${
                      activeFilter === 'employee' || activeFilter === 'employe'
                        ? 'btn-warning text-white' 
                        : 'btn-outline-warning'
                    }`}
                    onClick={() => setActiveFilter('employee')}
                  >
                    👔 Employés ({employeesCount})
                  </button>
                  <button 
                    className={`btn btn-sm rounded-pill px-3 fw-bold ${
                      activeFilter === 'admin' 
                        ? 'btn-danger text-white' 
                        : 'btn-outline-danger'
                    }`}
                    onClick={() => setActiveFilter('admin')}
                  >
                    👑 Admins ({adminsCount})
                  </button>
                </div>
              </div>

              <div className="table-responsive p-3">
                <table className="table align-middle table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={u.avatar || 'https://via.placeholder.com/40'} 
                                className="rounded-circle me-3 border shadow-sm" 
                                style={{width:'35px', height:'35px', objectFit:'cover'}} 
                                alt="avatar" 
                              />
                              <Link 
                                to={`/profile/${u.id}`} 
                                className="fw-semibold text-dark text-decoration-none hover-underline"
                              >
                                {u.name}
                              </Link>
                            </div>
                          </td>
                          <td>
                            <span className={`badge rounded-pill ${
                              u.role === 'admin' 
                                ? 'bg-danger text-white' 
                                : u.role === 'employee' || u.role === 'employe'
                                  ? 'bg-warning text-dark'
                                  : 'bg-info text-white'
                            }`}>
                              {u.role === 'employee' || u.role === 'employe' ? 'Employé' : u.role === 'admin' ? 'Admin' : 'Client'}
                            </span>
                          </td>
                          <td className="text-muted small">{u.email}</td>
                          <td className="text-muted small">{u.phone || 'Non renseigné'}</td>
                          <td className="text-center">
                            <div className="btn-group">
                              <Link to={`/modifierUtilisateur/${u.id}`} className="btn btn-sm btn-warning fw-bold mx-1 rounded shadow-sm">
                                <i className="fas fa-edit"></i>
                              </Link>
                              <button onClick={() => handleDelete(u.id)} className="btn btn-sm btn-outline-danger mx-1 rounded shadow-sm">
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          Aucun utilisateur trouvé avec ce rôle
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ÉTAT DE LA FLOTTE AUTO */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white py-3 border-0">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-car me-2 text-primary"></i>
                  État de la Flotte
                </h5>
              </div>
              <div className="card-body">
                {['available', 'reserved', 'maintenance'].map((status) => {
                  const count = allCars.filter(c => c.status === status).length;
                  const percent = allCars.length > 0 ? (count / allCars.length) * 100 : 0;
                  const color = status === 'available' ? 'success' : status === 'reserved' ? 'primary' : 'danger';
                  
                  return (
                    <div className="mb-4" key={status}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-capitalize small fw-bold text-muted">
                          {status === 'available' ? 'Disponible' : status === 'reserved' ? 'Réservé' : 'Maintenance'}
                        </span>
                        <span className="small fw-bold">{count}</span>
                      </div>
                      <div className="progress" style={{height: '6px'}}>
                        <div className={`progress-bar bg-${color}`} style={{width: `${percent}%`}}></div>
                      </div>
                    </div>
                  );
                })}
                <hr />
                <Link to="/gestionVoitures" className="btn btn-dark w-100 fw-bold py-2 rounded-3 shadow-sm">
                  <i className="fas fa-cog me-2"></i>
                  Gérer le parc automobile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FLOTTE AUTO */}
      {activeTab === 'cars' && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold text-dark">
              <i className="fas fa-car me-2 text-primary"></i>
              Gestion de la Flotte Automobile
            </h5>
            <Link to="/ajouterVoiture" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm">
              <i className="fas fa-plus me-2"></i>
              Ajouter une voiture
            </Link>
          </div>
          <div className="table-responsive p-3">
            <table className="table align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th>Véhicule</th>
                  <th>Catégorie</th>
                  <th>Prix/jour</th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allCars.map(car => (
                  <tr key={car.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={car.image || 'https://via.placeholder.com/50'} 
                          className="rounded-3 me-3" 
                          style={{width:'50px', height:'50px', objectFit:'cover'}} 
                          alt={car.name}
                        />
                        <div>
                          <span className="fw-bold">{car.name}</span>
                          <small className="d-block text-muted">{car.brand}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{car.category}</span>
                    </td>
                    <td className="fw-bold text-primary">{car.pricePerDay} MAD</td>
                    <td>
                      <span className={`badge rounded-pill ${
                        car.status === 'available' ? 'bg-success' : 
                        car.status === 'reserved' ? 'bg-warning' : 'bg-danger'
                      }`}>
                        {car.status === 'available' ? 'Disponible' : 
                         car.status === 'reserved' ? 'Réservé' : 'Maintenance'}
                      </span>
                    </td>
                    <td className="text-center">
                      <Link to={`/modifierVoiture/${car.id}`} className="btn btn-sm btn-warning rounded-pill px-3">
                        <i className="fas fa-edit me-2"></i>
                        Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONTACTS */}
      {activeTab === 'contacts' && (
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
                    className={`btn btn-sm ${contactFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill`}
                    onClick={() => setContactFilter('all')}
                  >
                    Tous ({contacts.length})
                  </button>
                  <button 
                    className={`btn btn-sm ${contactFilter === 'non lu' ? 'btn-warning' : 'btn-outline-warning'} rounded-pill position-relative`}
                    onClick={() => setContactFilter('non lu')}
                  >
                    Non lus
                    {unreadCount > 0 && (
                      <span className="badge bg-danger ms-1">{unreadCount}</span>
                    )}
                  </button>
                  <button 
                    className={`btn btn-sm ${contactFilter === 'répondu' ? 'btn-success' : 'btn-outline-success'} rounded-pill`}
                    onClick={() => setContactFilter('répondu')}
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
                        {selectedContact.userId && (
                          <small className="text-muted">
                            <i className="fas fa-user me-1"></i>
                            Utilisateur enregistré
                          </small>
                        )}
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

      {/* STYLES CSS */}
      <style jsx>{`
        .hover-underline:hover {
          text-decoration: underline !important;
          color: #0d6efd !important;
        }
      `}</style>
    </div>
  );
};

export default DashboardChef;