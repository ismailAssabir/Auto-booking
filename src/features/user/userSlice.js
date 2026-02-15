import { createSlice } from "@reduxjs/toolkit";
import { users } from "../../db";

const initialState = {
   users:  users
}
const userSlice = createSlice({
    name: "users",
    initialState,
    reducers :{
        addUser: (state, action)=>{
            state.users.push(action.payload)
        },
        deleteUser: (state, action)=>{
            state.users = state.users.filter(u=>u.id !== action.payload)
        },
        updateUser: (state, action)=>{
            const user= state.users.find(u=>u.id===action.payload.id);
            Object.assign(user, {...user,...action.payload})
            const index = state.users.indexOf(user);
            const currentUser = JSON.parse(localStorage.getItem("user"))
            if(currentUser.id === action.payload.id){
                localStorage.setItem('user',JSON.stringify(state.users[index]))
            }
        }
    }
})
export const {addUser, deleteUser, updateUser} = userSlice.actions
export default userSlice.reducer