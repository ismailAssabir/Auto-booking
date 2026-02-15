import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import carsReducer from '../features/cars/carsSlice'
import reservationReducer from '../features/reservation/reservationSlice'
import usersReducer from '../features/user/userSlice'
import inspectionReducer from '../features/inspection/inspectionSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cars: carsReducer,
    reservations: reservationReducer,
    users: usersReducer,
    inspections: inspectionReducer
  }
})
