import { createSlice } from "@reduxjs/toolkit";
import { cars } from "../../db";


const initialState = {
    cars: cars
}
 const carSlice = createSlice({
    name: "car",
    initialState,
    reducers:{
       updateCar: (state, action) => {
            const { id, status } = action.payload;

            const car = state.cars.find(car => car.id === id);

            if (car) {
                car.status = status;
            }
        },
        updateCarData: (state, action) => {
                const index = state.cars.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.cars[index] = {...state.cars[index],...action.payload};
                }
        },
        addCar: (state, action) => {
        state.cars.push(action.payload);
        },
        removeCar: (state, action) => {
        state.cars = state.cars.filter(c => c.id !== action.payload);
        }   
    }
 })
 export const {updateCar,updateCarData, addCar, removeCar} =  carSlice.actions
 export default carSlice.reducer