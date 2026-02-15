import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { updateUser, deleteUser } from "../features/user/userSlice";
import { deconnecter } from "../features/auth/authSlice";

const DashboardPerso = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.user);
  const allUsers = useSelector((state) => state.users.users) || [];
  const allReservations = useSelector((state) => state.reservations.reservations) || [];
  const allCars = useSelector((state) => state.cars.cars) || [];

  const [activeTab, setActiveTab] = useState("reservations");
  const [name, setName] = useState(currentUser?.name || "");
  const [previewAvatar, setPreviewAvatar] = useState(currentUser?.avatar || "");

  const [alert, setAlert] = useState({ show: false, msg: "", type: "" });

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  const getCarDetails = (carId) =>
    allCars.find((car) => Number(car.id) === Number(carId));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    dispatch(
      updateUser({
        id: currentUser.id,
        name: name,
        avatar: previewAvatar,
      })
    );

    setAlert({ show: true, msg: "Profil mis à jour !", type: "success" });
    setTimeout(() => setAlert({ show: false, msg: "", type: "" }), 3000);
  };

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vous déconnecter ?")) {
      dispatch(deconnecter());
      navigate("/login");
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container mt-4">
      {/* ALERT SYSTEM */}
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm`} role="alert">
          {alert.msg}
          <button type="button" className="btn-close" onClick={() => setAlert({ ...alert, show: false })}></button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white border rounded shadow-sm">
        <h2 className="text-primary mb-0 fw-bold">Espace Personnel</h2>
        <div className="d-flex align-items-center">
          <img
            src={currentUser?.avatar || "https://via.placeholder.com/45"}
            className="rounded-circle border me-3 shadow-sm"
            style={{ width: "45px", height: "45px", objectFit: "cover" }}
            alt="avatar"
          />
          <div className="me-3">
            <p className="mb-0 fw-bold lh-1">{currentUser?.name}</p>
            <small className="text-muted text-capitalize">{currentUser?.role}</small>
          </div>
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm fw-bold rounded-pill">
            ✕ Quitter
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded shadow-sm">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "reservations" ? "active shadow-sm" : ""}`} onClick={() => setActiveTab("reservations")}>
            📋 Réservations
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "users" ? "active shadow-sm" : ""}`} onClick={() => setActiveTab("users")}>
            👥 Liste Clients
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "profile" ? "active shadow-sm" : ""}`} onClick={() => setActiveTab("profile")}>
            👤 Mon Profil
          </button>
        </li>
      </ul>

      {/* TAB CONTENT: RESERVATIONS */}
      {activeTab === "reservations" && (
        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Véhicule</th>
                  <th>Dates</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allReservations.map((res) => (
                  <tr key={res.id}>
                    <td className="fw-bold text-dark">{getCarDetails(res.carId)?.name || "Véhicule supprimé"}</td>
                    <td><small className="text-muted">{res.startDate} au {res.endDate}</small></td>
                    <td>
                      <span className={`badge rounded-pill ${res.status === "pending" ? "bg-warning text-dark" : res.status === "confirmed" ? "bg-success" : "bg-secondary"}`}>
                        {res.status}
                      </span>
                    </td>
                    <td>
                      {res.status === "pending" && (
                        <Link to={`/inspectionVoiture/${res.id}`} className="btn btn-sm btn-success fw-bold shadow-sm px-3">
                          ⚙️ Inspecter
                        </Link>
                      )}
                      {res.status === "confirmed" && (
                        <Link to={`/retourVoiture/${res.id}`} className="btn btn-sm btn-danger fw-bold shadow-sm px-3">
                          🔁 Retour
                        </Link>
                      )}
                      {res.status === "completed" && (
                        <Link to={`/detailsInspection/${res.id}`} className="btn btn-sm btn-primary fw-bold shadow-sm px-3">
                          📋 Rapport
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LISTE CLIENTS */}
      {activeTab === "users" && (
        <div className="card shadow-sm border-0 p-3 rounded-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold">Gestion des Clients</h5>
            {/* LE BOUTON AJOUTER CLIENT */}
            <Link to="/ajouterUser/employee" className="btn btn-primary fw-bold rounded-pill px-4 shadow-sm">
              + Nouveau Client
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.filter((u) => u?.role === "client").map((u) => (
                  <tr key={u.id}>
                    <td>
                      <img src={u.avatar || "https://via.placeholder.com/30"} className="rounded-circle me-2 border shadow-sm" style={{ width: "35px", height: "35px", objectFit: "cover" }} alt="avatar" />
                      <span className="fw-semibold">{u.name}</span>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td className="text-center">
                      <Link to={`/modifierUtilisateur/${u.id}/${currentUser.role}`} className="btn btn-sm btn-warning me-2 fw-bold shadow-sm">
                        ✏️ Modifier
                      </Link>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => { if(window.confirm("Supprimer ce client ?")) dispatch(deleteUser(u.id)) }}>
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeTab === "profile" && (
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 p-4 rounded-4">
              <form onSubmit={handleUpdateProfile}>
                <div className="text-center mb-4 position-relative">
                  <img src={previewAvatar || "https://via.placeholder.com/130"} className="rounded-circle border border-4 border-white shadow" style={{ width: "130px", height: "130px", objectFit: "cover" }} alt="preview" />
                  <div className="mt-3">
                    <label htmlFor="upload-photo" className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm">
                      📸 Changer la photo
                    </label>
                    <input type="file" id="upload-photo" className="d-none" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-uppercase">Nom Complet</label>
                  <input type="text" className="form-control rounded-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold small text-uppercase text-muted">Adresse Email (non modifiable)</label>
                  <input type="text" className="form-control bg-light rounded-3 py-2" value={currentUser?.email || ""} disabled />
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold py-2 rounded-3 shadow">
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPerso;