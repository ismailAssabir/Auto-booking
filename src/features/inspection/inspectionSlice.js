import { createSlice } from "@reduxjs/toolkit";
import { inspections } from "../../db";

const initialState = {
    inspections: inspections
}

const inspectionSlice = createSlice({
    name: "inspections",
    initialState,
    reducers: {
        debutLivraision:(state, action)=>{
            const newInspection={
                id: state.inspections ? Math.max(...state.inspections.map(i=>i.id)): 1,
                reservationId: action.payload.reservationId,
                delivery: {
                fuelLevel: action.payload.fuelLevel,
                kilometrage: action.payload.kilometrage,
                notes: action.payload.notes,
                photos: action.payload.photos || []
                },
                retour: null
            }
            state.inspections.push(newInspection)
        },
        retourCar: (state, action) => {
                const { id, data } = action.payload;
                const inspection = state.inspections.find(i => i.reservationId === id);
                if (inspection) {
                    inspection.retour = {
                        fuelLevel: data.fuelLevel,
                        kilometrage: data.kilometrage,
                        notes: data.notes,
                        photos: data.photos || []
                    };
                }
            }

    }
})
export const {debutLivraision, retourCar} = inspectionSlice.actions
export default inspectionSlice.reducer