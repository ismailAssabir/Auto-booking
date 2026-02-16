import { useNavigate, useParams } from "react-router-dom";
import { updateCar } from "../features/cars/carsSlice";
import InspectionForm from "./InspectionForm";
import { useDispatch, useSelector } from "react-redux";
import { retourCar } from "../features/inspection/inspectionSlice";
import { confirmReservation } from "../features/reservation/reservationSlice";

const RetourVoiture = () => {
  const { resId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const reservations = useSelector(state => state.reservations.reservations);
  const reservation = reservations.find(r => r.id === Number(resId));

  const handleRetourSubmit = (formData) => {

    dispatch(retourCar({
      id: Number(resId),
      data: formData
    }));

    dispatch(confirmReservation({
      id: Number(resId),
      status: "completed"
    }));
    dispatch(updateCar({
      id: reservation.carId,
      status: "available"
    }));
   
    alert("Retour enregistré !");
    navigate("/dashboard/personnel");
  };

  return (
    <InspectionForm
      title="Inspection de Retour (Restitution)"
      buttonText="Confirmer Retour"
      onSubmit={handleRetourSubmit}
    />
  );
};
export default RetourVoiture