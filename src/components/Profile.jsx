import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
export default function Profil() {
  const { id } = useParams();
  const navigate = useNavigate();

  const users = useSelector(state => state.users.users);
  const reservations = useSelector(state => state.reservations.reservations);
  const cars = useSelector(state => state.cars.cars);
  const user = users.find((u) => u.id === Number(id));

  const userReservations = reservations.filter(
    (res) => res.userId === Number(id)
  );

  if (!user) {
    return <div className="container mt-5">Utilisateur introuvable</div>;
  }

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-lg rounded-4 mb-5 overflow-hidden">
        <div className="bg-primary text-white p-4 d-flex align-items-center">

          <img
              src={user.avatar}
              alt={user.name}
              className="rounded-circle border border-4 border-white me-4"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />

          <div>
            <h2 className="fw-bold mb-1">{user.name}</h2>
            <p className="mb-1">{user.email}</p>
            <span className="badge bg-warning text-dark px-3 py-2">
              {user.role}
            </span>
          </div>

        </div>

        {/* STATS */}
        <div className="row text-center p-4 bg-light">
          <div className="col-md-4">
            <h4 className="fw-bold text-primary">{userReservations.length}</h4>
            <small className="text-muted">Réservations</small>
          </div>

          <div className="col-md-4">
            <h4 className="fw-bold text-success">
              {userReservations.filter(r => {
                const car = cars.find(c => c.id === r.carId);
                return car?.status === "available";
              }).length}
            </h4>
            <small className="text-muted">Voitures actives</small>
          </div>

          <div className="col-md-4">
            <h4 className="fw-bold text-danger">
              {userReservations.filter(r => {
                const car = cars.find(c => c.id === r.carId);
                return car?.status !== "available";
              }).length}
            </h4>
            <small className="text-muted">Terminées</small>
          </div>
        </div>
      </div>

      {/* ===== RESERVATIONS ===== */}
      <h3 className="fw-bold mb-4">Mes Réservations 🚗</h3>

      {userReservations.length === 0 && (
        <div className="alert alert-info rounded-4 shadow-sm">
          Aucune réservation pour le moment.
        </div>
      )}

      <div className="row">
        {userReservations.map((res) => {
          const car = cars.find((c) => c.id === res.carId);

          return (
            <div key={res.id} className="col-md-4 mb-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">

                {/* CAR IMAGE */}
                <img
                  src={car?.image}
                  alt={car?.name}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />

                <div className="card-body d-flex flex-column">

                  <h5 className="fw-bold">{car?.name}</h5>

                  <p className="text-muted small mb-2">
                    ⚙ {car?.transmission} | 💺 {car?.seats} places
                  </p>

                  <p className="fw-bold text-primary">
                    {car?.pricePerDay} MAD / jour
                  </p>

                  <div className="mb-3">
                    <small>📅 Du: {res.dateStart}</small><br />
                    <small>📅 Au: {res.dateEnd}</small>
                  </div>

                  <span
                    className={`badge ${
                      car?.status === "available"
                        ? "bg-success"
                        : car?.status === "reserved"
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                  >
                    {car?.status}
                  </span>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BACK BUTTON */}
      <div className="text-center mt-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline-primary px-5 py-2 rounded-pill fw-bold"
        >
          ← Retour
        </button>
      </div>

    </div>
  );
}
