import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import FormUser from "./FormUser";
import { addUser, updateUser } from "../features/user/userSlice";
import { connecter } from "../features/auth/authSlice";

export default function ModifierUtilisateur(){
    const dispatch = useDispatch();
    const navigate = useNavigate()
     const {id} = useParams()
    const users = useSelector(state=>state.users.users)
    const user = users.find(u=>u.id === Number(id))
    const currentUser = useSelector((state) => state.auth.user);
    console.log(currentUser)
    const handleSubmit = (e) => {
  e.preventDefault();

  const file = e.target.image.files[0];
  const name = e.target.nom.value;
  const email = e.target.email.value;
  const password = e.target.pass.value;

  const saveUser = (avatar) => {
    const newUser = {
      id: user.id,
      name,
      email,
      password,
      avatar,
      role: user.role
    };
    dispatch(updateUser(newUser));
    if (currentUser.role === "admin") {
      navigate("/dashboard/chef");
    } else if (currentUser.role === "employee") {
      navigate("/dashboard/personnel");
    } else {
      navigate("/dashboard/client");
    }
  };

  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      saveUser(reader.result);
    };
    reader.readAsDataURL(file);
  } else {
    saveUser(user.avatar);
  }
};
    return <FormUser data={user} btnText="Modifier" handleSubmit={handleSubmit}/>
}