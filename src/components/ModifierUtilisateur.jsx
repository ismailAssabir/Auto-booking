import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import FormUser from "./FormUser";
import { addUser } from "../features/user/userSlice";
import { connecter } from "../features/auth/authSlice";

export default function ModifierUtilisateur(){
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const handleSubmit = (e)=>{
        e.preventDefault()
        const file = e.target.image.files[0];
                 
                     const name= e.target.nom.value
                     const email= e.target.email.value
                     const password= e.target.pass.value
                  const reader = new FileReader();
        
                  reader.onloadend = () => {
                    const newUser = {
                      id: user.id,
                      name: name,
                      email: email,
                      password: password,
                      avatar: reader.result ? reader.result : user.avatar,
                      role: "client"
                    };
        
                    dispatch(addUser(newUser));
                    dispatch(connecter(newUser));
                  };
        
                  reader.readAsDataURL(file);
                  if(role ==="client"){
                    navigate("/dashboard/client")
                  }else if(role === "admin"){
                    navigate("/dashboard/chef")
                  }else{
                    navigate("/dashboard/personnel")
                  }
    }
    const {id, role} = useParams()
    const users = useSelector(state=>state.users.users)
    const user = users.find(u=>u.id === Number(id))

    return <FormUser data={user} btnText="Modifier" handleSubmit={handleSubmit}/>
}