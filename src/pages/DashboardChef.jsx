import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { deconnecter } from '../features/auth/authSlice';
import { deleteUser } from '../features/user/userSlice';

const DashboardChef = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Récupération des données globales du store
  const allReservations = useSelector(state => state.reservations.reservations) || [];
  const allCars = useSelector(state => state.cars.cars) || [];
  const allUsers = useSelector(state => state.users.users) || [];
  const currentUser = useSelector(state => state.auth.user);

  // 2. Calcul des KPI (Indicateurs de performance)
  const totalRevenue = allReservations
    .filter(res => res.status === 'confirmed')
    .reduce((acc, res) => {
      const car = allCars.find(c => c.id === res.carId);
      return acc + (car ? Number(car.pricePerDay) : 0);
    }, 0);

  const stats = [
    { label: 'Chiffre d\'affaires', value: `${totalRevenue} MAD`, icon: '💰', color: 'text-success', bg: 'bg-success-subtle' },
    { label: 'Réservations', value: allReservations.length, icon: '📋', color: 'text-primary', bg: 'bg-primary-subtle' },
    { label: 'Flotte auto', value: allCars.length, icon: '🚗', color: 'text-warning', bg: 'bg-warning-subtle' },
    { label: 'Total Clients', value: allUsers.filter(u => u.role === 'client').length, icon: '👥', color: 'text-info', bg: 'bg-info-subtle' },
  ];

  // 3. Actions
  const handleLogout = () => {
    if (window.confirm("Voulez-vous quitter la session administrateur ?")) {
      dispatch(deconnecter());
      navigate('/login');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer définitivement cet utilisateur ?")) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="fw-bold mb-0">Dashboard Direction</h2>
          <p className="text-muted">Bienvenue, M. {currentUser?.name}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline-danger fw-bold rounded-pill px-4">
          Déconnexion
        </button>
      </div>

      {/* CARTES STATISTIQUES */}
      <div className="row g-3 mb-4">
        {stats.map((stat, index) => (
          <div className="col-md-3" key={index}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className={`rounded-3 p-3 me-3 ${stat.bg} ${stat.color} fs-3`}>
                  {stat.icon}
                </div>
                <div>
                  <h6 className="text-muted mb-1 small uppercase fw-bold">{stat.label}</h6>
                  <h4 className="fw-bold mb-0">{stat.value}</h4>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* TABLEAU DE GESTION DES UTILISATEURS */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 fw-bold">👥 Gestion des Utilisateurs</h5>
            </div>
            <div className="table-responsive p-3">
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Email</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={u.avatar || 'https://via.placeholder.com/40'} 
                            className="rounded-circle me-3 border" 
                            style={{width:'35px', height:'35px', objectFit:'cover'}} 
                            alt="avatar" 
                          />
                          <span className="fw-semibold">{u.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${u.role === 'admin' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-muted small">{u.email}</td>
                      <td className="text-center">
                        <div className="btn-group">
                          {/* LIEN DEMANDÉ : Redirige vers modifierUtilisateur avec ID et rôle admin */}
                          <Link 
                            to={`/modifierUtilisateur/${u.id}/admin`} 
                            className="btn btn-sm btn-warning fw-bold mx-1 rounded"
                          >
                            ✏️ Modifier
                          </Link>
                          <button 
                            onClick={() => handleDelete(u.id)}
                            className="btn btn-sm btn-outline-danger mx-1 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ÉTAT DE LA FLOTTE AUTO */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 fw-bold">🏎️ État de la Flotte</h5>
            </div>
            <div className="card-body">
              {['available', 'reserved', 'maintenance'].map((status) => {
                const count = allCars.filter(c => c.status === status).length;
                const percent = allCars.length > 0 ? (count / allCars.length) * 100 : 0;
                const color = status === 'available' ? 'success' : status === 'reserved' ? 'primary' : 'danger';
                
                return (
                  <div className="mb-4" key={status}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-capitalize small fw-bold">{status}</span>
                      <span className="small fw-bold">{count}</span>
                    </div>
                    <div className="progress" style={{height: '6px'}}>
                      <div className={`progress-bar bg-${color}`} style={{width: `${percent}%`}}></div>
                    </div>
                  </div>
                );
              })}
              <hr />
              <Link to="/gestionVoitures" className="btn btn-dark w-100 fw-bold py-2">
                Gérer le parc automobile
              </Link>
            </div>
          </div>

          {/* RÉSUMÉ RÉSERVATIONS */}
          <div className="card border-0 shadow-sm rounded-4 bg-primary text-white p-3">
             <h6 className="fw-bold mb-3">Dernière réservation</h6>
             {allReservations.length > 0 ? (
               <div>
                 <p className="small mb-1">
                   Voiture ID: {allReservations[allReservations.length - 1].carId}
                 </p>
                 <p className="mb-0 fw-bold">Statut: {allReservations[allReservations.length - 1].status}</p>
               </div>
             ) : (
               <p className="small mb-0">Aucune donnée disponible</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardChef;