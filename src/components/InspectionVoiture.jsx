import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { debutLivraision } from "../features/inspection/inspectionSlice";
import { confirmReservation } from "../features/reservation/reservationSlice";
import InspectionForm from "../components/InspectionForm";

const InspectionVoiture = () => {
  const { resId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInspectionSubmit = (formData) => {

    dispatch(debutLivraision({
      reservationId: Number(resId),
      ...formData
    }));

    dispatch(confirmReservation({
      id: Number(resId)
    }));

    alert("Inspection de départ enregistrée !");
    navigate("/dashboard/personnel");
  };

  return (
    <InspectionForm
      title="Inspection de Départ (Livraison)"
      buttonText="Valider la livraison"
      onSubmit={handleInspectionSubmit}
    />
  );
};

export default InspectionVoiture;
