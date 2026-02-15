import { createSlice } from "@reduxjs/toolkit";
import { reservations } from "../../db";

const initialState = {
    reservations: reservations,
    loading: false,
    erreur: ""
}
const reservationSlice = createSlice({
    name : "reservation",
    initialState,
    reducers:{
        addReservation: (state, action)=>{
            const idRes = state.reservations ? Math.max(...state.reservations.map(r=>r.id)): 1;
            state.reservations.push({id: idRes + 1,status: "pending",employeeId:null,createdAt: new Date().toISOString().split('T')[0] ,...action.payload})
        },
      confirmReservation: (state, action) => {
         console.log("ACTION ID:", action.payload.id);
            state.reservations = state.reservations.map(res =>
                Number(res.id) === Number(action.payload.id)
                ? { ...res, status: "confirmed" }
                : res
            );
        },
        canceledReservation: (state, action)=>state.reservations.map(r=>{
                if(r.id === action.payload){
                    return {...r, status:"canceled"}
                } return r
            })
    }
})
export const {addReservation, confirmReservation, canceledReservation}= reservationSlice.actions
export default reservationSlice.reducer