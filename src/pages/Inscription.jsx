import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../features/user/userSlice";
import { useNavigate } from "react-router-dom";
import { connecter } from "../features/auth/authSlice";
import FormUser from "../components/FormUser";

export default function Inscription() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const users = useSelector(state => state.users?.users || []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Génération de l'ID
        const iduser = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        const name = e.target.nom.value;
        const email = e.target.email.value;
        const password = e.target.pass.value;
        const phone = e.target.phone.value;
        const file = e.target.image?.files[0];

        // Avatar par défaut (placeholder)
        const defaultAvatar = "https://via.placeholder.com/150/0D6EFD/FFFFFF?text=User";

        // Avatar avec initiales via UI Avatars
        const getInitialsAvatar = () => {
            const initials = name
                .split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('')
                .slice(0, 2);
            
            return `https://ui-avatars.com/api/?name=${initials}&background=0D6EFD&color=fff&size=150&bold=true&length=2`;
        };

        // Création de l'utilisateur
        const createUser = (avatarUrl) => {
            const newUser = {
                id: iduser,
                name: name,
                email: email,
                password: password,
                phone: phone,
                avatar: avatarUrl,
                role: "client",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            dispatch(addUser(newUser));
            dispatch(connecter(newUser));
            navigate("/dashboard/client");
        };

        if (file) {
            // Validation de la taille du fichier (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("L'image ne doit pas dépasser 5MB. Utilisation de l'avatar par défaut.");
                createUser(getInitialsAvatar());
                return;
            }

            // Validation du type de fichier
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                alert("Format d'image non supporté. Utilisez JPG, PNG ou GIF. Utilisation de l'avatar par défaut.");
                createUser(getInitialsAvatar());
                return;
            }

            // Lecture du fichier
            const reader = new FileReader();
            reader.onloadend = () => {
                createUser(reader.result);
            };
            reader.onerror = () => {
                console.error("Erreur de lecture du fichier");
                createUser(getInitialsAvatar());
            };
            reader.readAsDataURL(file);
        } else {
            // Pas d'image -> avatar avec initiales
            createUser(getInitialsAvatar());
        }
    };

    return <FormUser 
        btnText="Inscrire" 
        handleSubmit={handleSubmit} 
        data={{
            name: "",
            email: "",
            password: "",
            phone: "",
            avatar: ""
        }}
    />;
}