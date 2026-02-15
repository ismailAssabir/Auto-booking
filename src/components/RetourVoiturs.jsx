import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { retourCar } from "../features/inspection/inspectionSlice";
import { updateReservationStatus } from "../features/reservation/reservationSlice";
import InspectionForm from "../components/InspectionForm";

const RetourVoiture = () => {
  const { resId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRetourSubmit = (formData) => {

    dispatch(retourCar({
      id: Number(resId),
      data: formData
    }));

    dispatch(updateReservationStatus({
      id: Number(resId),
      status: "completed"
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

export default RetourVoiture;
