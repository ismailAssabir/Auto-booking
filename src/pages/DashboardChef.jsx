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
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filtrage des contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesFilter = contactFilter === 'all' || contact.status === contactFilter;
    const matchesSearch = searchTerm === '' || 
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (a.status === 'non lu' && b.status !== 'non lu') return -1;
    if (a.status !== 'non lu' && b.status === 'non lu') return 1;
    return new Date(b.date) - new Date(a.date);
  });

  const unreadCount = contacts.filter(c => c.status === 'non lu').length;

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      
      {/* ALERT SYSTEM */}
      {alert.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-lg border-0 rounded-4`} role="alert">
            <div className="d-flex align-items-center">
              <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2 fs-5`}></i>
              {alert.msg}
            </div>
            <button type="button" className="btn-close" onClick={() => setAlert({ ...alert, show: false })}></button>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 px-3 py-3 bg-white rounded-4 shadow-sm">
          <div>
            <h2 className="fw-bold mb-0 text-dark">
              <i className="fas fa-crown text-warning me-2"></i>
              Dashboard Direction
            </h2>
            <p className="text-muted small mb-0">Bienvenue, {currentUser?.name}</p>
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
              <div className="card border-0 shadow-sm rounded-4 h-100">
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
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-light'} rounded-pill px-4 fw-semibold`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fas fa-users me-2"></i>
              Utilisateurs
            </button>
            <button 
              className={`btn ${activeTab === 'cars' ? 'btn-primary' : 'btn-light'} rounded-pill px-4 fw-semibold`}
              onClick={() => setActiveTab('cars')}
            >
              <i className="fas fa-car me-2"></i>
              Flotte Auto
            </button>
            <button 
              className={`btn ${activeTab === 'contacts' ? 'btn-primary' : 'btn-light'} rounded-pill px-4 fw-semibold position-relative`}
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
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white py-3 border-0 px-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold text-dark">
                      <i className="fas fa-users me-2 text-primary"></i>
                      Liste des Utilisateurs
                    </h5>
                    <Link to="/ajouterUser" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm">
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
                        activeFilter === 'employee' 
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

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="ps-4">Utilisateur</th>
                        <th>Rôle</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center">
                                <img 
                                  src={u.avatar || 'https://via.placeholder.com/40'} 
                                  className="rounded-circle me-3 border shadow-sm" 
                                  style={{width:'40px', height:'40px', objectFit:'cover'}} 
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
                              <span className={`badge rounded-pill px-3 py-2 ${
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
                            <td className="text-end pe-4">
                              <div className="btn-group">
                                <Link to={`/modifierUtilisateur/${u.id}/admin`} className="btn btn-outline-secondary btn-sm rounded-start">
                                  <i className="fas fa-edit">✏️</i>
                                </Link>
                                <button onClick={() => handleDelete(u.id)} className="btn btn-outline-danger btn-sm rounded-end">
                                  <i className="fas fa-trash">🗑️</i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-5 text-muted">
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
                <div className="card-header bg-white py-3 border-0 px-4">
                  <h5 className="mb-0 fw-bold text-dark">
                    <i className="fas fa-car me-2 text-primary"></i>
                    État de la Flotte
                  </h5>
                </div>
                <div className="card-body px-4">
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
                        <div className="progress" style={{height: '8px', borderRadius: '4px'}}>
                          <div className={`progress-bar bg-${color}`} style={{width: `${percent}%`}}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: FLOTTE AUTO */}
        {activeTab === 'cars' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-0 px-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-car me-2 text-primary"></i>
                Gestion de la Flotte Automobile
              </h5>
              <Link to="/ajouterVoiture" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm">
                <i className="fas fa-plus me-2"></i>
                Ajouter une voiture
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="ps-4">Véhicule</th>
                    <th>Catégorie / Prix</th>
                    <th>État Actuel</th>
                    <th className="text-center">Actions sur le statut</th>
                    <th className="text-end pe-4">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {allCars.length > 0 ? (
                    allCars.map(car => (
                      <tr key={car.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <img 
                              src={car.image || 'https://via.placeholder.com/80x50'} 
                              alt={car.name} 
                              className="rounded-3 me-3" 
                              style={{ width: '80px', height: '50px', objectFit: 'cover' }} 
                            />
                            <div>
                              <div className="fw-bold text-dark">{car.name}</div>
                              <div className="text-muted small">ID: #{car.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-primary">{car.pricePerDay} MAD / jour</div>
                          <div className="small text-muted">{car.transmission} | {car.seats} places</div>
                        </td>
                        <td>
                          <span className={`badge rounded-pill px-3 py-2 ${
                            car.status === 'available' ? 'bg-success-subtle text-success' : 
                            car.status === 'maintenance' ? 'bg-danger-subtle text-danger' : 
                            'bg-warning-subtle text-warning'
                          }`}>
                            {car.status === 'available' ? '● Disponible' : 
                             car.status === 'maintenance' ? '● Maintenance' : '● Réservée'}
                          </span>
                        </td>
                        <td className="text-center">
                          <select 
                            className="form-select form-select-sm w-auto d-inline-block rounded-pill"
                            value={car.status}
                            onChange={(e) => {
                              // Dispatch update status
                            }}
                          >
                            <option value="available">Disponible</option>
                            <option value="reserved">Réservée</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group">
                            <Link to={`/modifierVoiture/${car.id}`} className="btn btn-outline-secondary btn-sm rounded-start">
                              <i className="fas fa-edit">✏️</i>
                            </Link>
                            <button 
                              onClick={() => {
                                if(window.confirm("Supprimer ce véhicule ?")) {
                                  // Dispatch delete
                                }
                              }} 
                              className="btn btn-outline-danger btn-sm rounded-end"
                            >
                              <i className="fas fa-trash">🗑️</i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        Aucun véhicule enregistré dans la base de données.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT: CONTACTS - DESIGN PROFESSIONNEL */}
        {activeTab === 'contacts' && (
          <div className="row g-4">
            {/* Liste des contacts - Style moderne avec cartes */}
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
                        <i className="fas fa-envelope-open me-1"></i> {unreadCount}
                      </span>
                    </div>
                  </div>

                  {/* Barre de recherche */}
                  <div className="position-relative mb-4">
                    <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    <input
                      type="text"
                      className="form-control rounded-pill bg-light border-0 ps-5 py-2"
                      placeholder="Rechercher un message..."
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

                  {/* Filtres */}
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span 
                      className={`badge ${contactFilter === 'all' ? 'bg-primary' : 'bg-light text-dark'} rounded-pill px-3 py-2 cursor-pointer`}
                      onClick={() => setContactFilter('all')}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fas fa-stream me-1"></i> Tous
                    </span>
                    <span 
                      className={`badge ${contactFilter === 'non lu' ? 'bg-warning' : 'bg-light text-dark'} rounded-pill px-3 py-2 cursor-pointer`}
                      onClick={() => setContactFilter('non lu')}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fas fa-circle me-1"></i> Non lus
                      {unreadCount > 0 && contactFilter !== 'non lu' && (
                        <span className="badge bg-danger rounded-pill ms-1">{unreadCount}</span>
                      )}
                    </span>
                    <span 
                      className={`badge ${contactFilter === 'répondu' ? 'bg-success' : 'bg-light text-dark'} rounded-pill px-3 py-2 cursor-pointer`}
                      onClick={() => setContactFilter('répondu')}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fas fa-check-circle me-1"></i> Répondu
                    </span>
                  </div>
                </div>

                <div className="card-body p-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {sortedContacts.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                        <i className="fas fa-inbox fa-3x text-muted"></i>
                      </div>
                      <h6 className="text-muted">Aucun message trouvé</h6>
                      <p className="text-muted small">Essayez de modifier vos filtres</p>
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

            {/* Détail du message */}
            <div className="col-lg-7 col-xl-8">
              {selectedContact ? (
                <div className="card border-0 shadow-sm rounded-4">
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
                    {/* Informations expéditeur */}
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

                    {/* Message */}
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

                    {/* Réponses existantes */}
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
                            Envoyer
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
                      Cliquez sur un message dans la liste pour voir son contenu et y répondre
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lien retour */}
        <div className="mt-4">
          <Link to="/" className="text-decoration-none text-secondary fw-bold">
            <i className="fas fa-arrow-left me-2"></i> Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* STYLES CSS */}
      <style jsx>{`
        .hover-underline:hover {
          text-decoration: underline !important;
          color: #0d6efd !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .bg-success-subtle {
          background-color: rgba(25, 135, 84, 0.1);
        }
        .bg-danger-subtle {
          background-color: rgba(220, 53, 69, 0.1);
        }
        .bg-warning-subtle {
          background-color: rgba(255, 193, 7, 0.1);
        }
        .bg-primary.bg-opacity-10 {
          background-color: rgba(13, 110, 253, 0.1);
        }
        .bg-success.bg-opacity-10 {
          background-color: rgba(25, 135, 84, 0.1);
        }
        .bg-warning.bg-opacity-10 {
          background-color: rgba(255, 193, 7, 0.1);
        }
        .table thead th {
          background-color: #212529;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 1rem 0.5rem;
        }
        .btn-group .btn {
          border: 1px solid #dee2e6;
        }
        .btn-group .btn:first-child {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        .btn-group .btn:last-child {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        .progress {
          border-radius: 4px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default DashboardChef;