import React, { useState } from "react";

const InspectionForm = ({
  title,
  buttonText,
  onSubmit,
  initialData = {}
}) => {

  const [formData, setFormData] = useState({
    fuelLevel: initialData.fuelLevel || 50,
    kilometrage: initialData.kilometrage || "",
    notes: initialData.notes || "",
    photos: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="mb-4">{title}</h3>

        <form onSubmit={handleSubmit}>
          {/* Fuel */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Niveau Carburant ({formData.fuelLevel}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              className="form-range"
              value={formData.fuelLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fuelLevel: e.target.value
                })
              }
            />
          </div>

          {/* Kilometrage */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Kilométrage (km)
            </label>
            <input
              type="number"
              className="form-control"
              required
              value={formData.kilometrage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  kilometrage: e.target.value
                })
              }
            />
          </div>

          {/* Notes */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Notes
            </label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.notes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notes: e.target.value
                })
              }
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary fw-bold px-4"
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InspectionForm;
