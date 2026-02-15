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
  const allReservations =
    useSelector((state) => state.reservations.reservations) || [];
  const allCars = useSelector((state) => state.cars.cars) || [];

  const [activeTab, setActiveTab] = useState("reservations");
  const [name, setName] = useState(currentUser?.name || "");
  const [previewAvatar, setPreviewAvatar] = useState(
    currentUser?.avatar || ""
  );

  const [alert, setAlert] = useState({
    show: false,
    msg: "",
    type: "",
  });

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

    setAlert({
      show: true,
      msg: "Profil mis à jour avec succès !",
      type: "success",
    });

    setTimeout(
      () => setAlert({ show: false, msg: "", type: "" }),
      3000
    );
  };

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vous déconnecter ?")) {
      localStorage.removeItem("user");
      dispatch(deconnecter());
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container mt-4">
      {/* ALERT */}
      {alert.show && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm`}
          role="alert"
        >
          {alert.msg}
          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setAlert({ ...alert, show: false })
            }
          ></button>
        </div>
      )}

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white border rounded shadow-sm">
        <h2 className="text-primary mb-0">Espace Personnel</h2>

        <div className="text-end">
          <img
            src={currentUser?.avatar}
            className="rounded-circle border me-2"
            style={{
              width: "45px",
              height: "45px",
              objectFit: "cover",
            }}
            alt="avatar"
          />
          <span className="fw-bold me-2">
            {currentUser?.name}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm fw-bold"
          >
            ✕ Déconnexion
          </button>
        </div>
      </div>

      {/* TABS */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "reservations"
                ? "active fw-bold"
                : ""
            }`}
            onClick={() =>
              setActiveTab("reservations")
            }
          >
            📋 Réservations
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "users"
                ? "active fw-bold"
                : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            👥 Liste Clients
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "profile"
                ? "active fw-bold"
                : ""
            }`}
            onClick={() =>
              setActiveTab("profile")
            }
          >
            👤 Mon Profil
          </button>
        </li>
      </ul>

      {/* CONTENT */}
      {activeTab === "reservations" && (
        <div className="card shadow-sm border-0">
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
                    <td className="fw-bold">
                      {getCarDetails(res.carId)
                        ?.name || "Inconnu"}
                    </td>

                    <td>
                      {res.startDate} au {res.endDate}
                    </td>

                    <td>
                      <span
                        className={`badge
                        ${
                          res.status === "pending"
                            ? "bg-warning text-dark"
                            : ""
                        }
                        ${
                          res.status === "confirmed"
                            ? "bg-success"
                            : ""
                        }
                        ${
                          res.status === "completed"
                            ? "bg-secondary"
                            : ""
                        }
                      `}
                      >
                        {res.status}
                      </span>
                    </td>

                    <td>
                      {res.status === "pending" && (
                        <Link
                          to={`/inspectionVoiture/${res.id}`}
                          className="btn btn-sm btn-success fw-bold shadow-sm"
                        >
                          ⚙️ Inspecter & Confirmer
                        </Link>
                      )}

                      {res.status === "confirmed" && (
                        <Link
                          to={`/retourVoiture/${res.id}`}
                          className="btn btn-sm btn-danger fw-bold shadow-sm"
                        >
                          🔁 Retour Véhicule
                        </Link>
                      )}

                      {res.status === "completed" && (
                        <Link
                          to={`/detailsInspection/${res.id}`}
                          className="btn btn-sm btn-primary fw-bold shadow-sm"
                        >
                          📋 Voir Inspection
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

      {/* LISTE CLIENTS */}
      {activeTab === "users" && (
        <div className="card shadow-sm border-0 p-3">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {allUsers
                .filter(
                  (u) => u?.role === "client"
                )
                .map((u) => (
                  <tr key={u.id}>
                    <td>
                      <img
                        src={u.avatar}
                        className="rounded-circle me-2"
                        style={{
                          width: "30px",
                          height: "30px",
                          objectFit: "cover",
                        }}
                        alt="u"
                      />
                      {u.name}
                    </td>
                    <td>{u.email}</td>
                    <td className="text-center">
                      <Link
                        to={`/modifierUtilisateur/${u.id}/${currentUser.role}`}
                        className="btn btn-sm btn-warning me-2 fw-bold"
                      >
                        ✏️ Modifier
                      </Link>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          dispatch(
                            deleteUser(u.id)
                          )
                        }
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PROFILE */}
      {activeTab === "profile" && (
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 p-4">
              <form
                onSubmit={handleUpdateProfile}
              >
                <div className="text-center mb-4">
                  <img
                    src={previewAvatar}
                    className="rounded-circle border border-4 border-primary shadow"
                    style={{
                      width: "130px",
                      height: "130px",
                      objectFit: "cover",
                    }}
                    alt="preview"
                  />
                  <div className="mt-3">
                    <label
                      htmlFor="upload-photo"
                      className="btn btn-sm btn-outline-primary"
                    >
                      Changer la photo
                    </label>
                    <input
                      type="file"
                      id="upload-photo"
                      className="d-none"
                      accept="image/*"
                      onChange={
                        handleFileChange
                      }
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">
                    Mon Nom
                  </label>
                  <input type="text" className="form-control" value={name}  onChange={(e) =>setName(e.target.value ) } require />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold small">
                    Mon Email
                  </label>
                  <input type="text" className="form-control bg-light" value={ currentUser?.email || ""}disabled/>
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold shadow-sm">
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
