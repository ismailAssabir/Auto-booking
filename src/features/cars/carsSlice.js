import { createSlice } from "@reduxjs/toolkit";
import { cars } from "../../db";


const initialState = {
    cars: cars
}
 const carSlice = createSlice({
    name: "car",
    initialState,
    reducers:{
        updateCar:(state, action)=>{
            const car = state.cars.find(c=>c.id===action.payload.id);
            return state.cars.map(c=>{
                if(c.id === car.id){
                    return action.payload
                }
                return c
            })
        },
        updateCarData: (state, action) => {
                const index = state.cars.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.cars[index] = action.payload;
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