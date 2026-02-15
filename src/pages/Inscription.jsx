import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../features/user/userSlice";
import { useNavigate } from "react-router-dom";
import { connecter } from "../features/auth/authSlice";
import FormUser from "../components/FormUser";

export default function Inscription(){
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const users = useSelector(state=> state.users.users)
  
    const handleSubmit = async (e)=>{
       const iduser= users ? Math.max(...users.map(u=>u.id)): 0;
        e.preventDefault()
        const file = e.target.image.files[0];
         
             const name= e.target.nom.value
             const email= e.target.email.value
             const password= e.target.pass.value
          const reader = new FileReader();

          reader.onloadend = () => {
            const newUser = {
              id:iduser +1,
              name: name,
              email: email,
              password: password,
              avatar: reader.result,
              role: "client"
            };

            dispatch(addUser(newUser));
            dispatch(connecter(newUser));
          };

          reader.readAsDataURL(file);

          navigate("/dashboard/client")
    }
    return <FormUser btnText="Inscrire" handleSubmit={handleSubmit} data={
       {name: "",
        email: "",
        password: "",
        avatar: ""}
    }/>
}