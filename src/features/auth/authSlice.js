import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    user: localStorage.getItem("user")? JSON.parse(localStorage.getItem("user")): null,
    autentifier: false,
    erreur: null
}
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        connecter: (state, action)=>{

            if(action.payload.err){
                state.erreur = "votre mot de passe ou email est incorrect!!!"
            }
            else{
                state.user = action.payload;
                state.autentifier = true;
                state.erreur = null;
                localStorage.setItem("user", JSON.stringify(action.payload));
            }},
        deconnecter: (state)=>{
            localStorage.removeItem("user");
            state.user= null;
            state.autentifier = false
        },
        verifierAuth: (state)=>{
            const findUser = localStorage.getItem('user');
            if(findUser){
                state.user = JSON.parse(findUser);
                state.autentifier = true
            }
        }
    }
})
export default authSlice.reducer
export const {connecter, deconnecter , verifierAuth} = authSlice.actions