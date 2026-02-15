import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container vh-100 d-flex flex-column justify-content-center align-items-center text-center">
      <div className="row justify-content-center w-100">
        <div className="col-md-6">
          {/* Illustration visuelle 404 */}
          <h1 className="display-1 fw-bold text-primary mb-0">404</h1>
          <div className="mb-4">
            <span className="fs-2 fw-semibold text-dark">Oups ! Page introuvable</span>
          </div>
          
          <p className="text-muted mb-5 px-md-5">
            Désolé, la page que vous recherchez semble avoir pris la route sans nous. 
            Il est possible que l'adresse soit erronée ou que la page ait été déplacée.
          </p>

          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <Link to="/" className="btn btn-primary btn-lg px-4 rounded-pill shadow-sm fw-bold">
              <i className="fas fa-home me-2"></i>Retour à l'accueil
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-outline-secondary btn-lg px-4 rounded-pill fw-bold"
            >
              Page précédente
            </button>
          </div>
        </div>
      </div>

      {/* Un petit décor discret en bas */}
      <div className="mt-5 opacity-25">
        <i className="fas fa-car-crash fa-5x text-secondary"></i>
      </div>
    </div>
  );
};

export default NotFound;