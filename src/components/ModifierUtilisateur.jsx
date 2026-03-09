import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import FormUser from "./FormUser";
import { updateUser } from "../features/user/userSlice";
import { connecter } from "../features/auth/authSlice";

export default function ModifierUtilisateur() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    
    const users = useSelector(state => state.users?.users || []);
    const user = users.find(u => u.id === Number(id));
    const currentUser = useSelector((state) => state.auth.user);

    // Redirection si l'utilisateur n'existe pas
    if (!user) {
        navigate(-1);
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        const file = e.target.image?.files[0];
        const name = e.target.nom?.value;
        const email = e.target.email?.value;
        const password = e.target.pass?.value;
        const phone = e.target.phone?.value; // Récupération du téléphone

        const saveUser = (avatar) => {
            // Création de l'objet utilisateur mis à jour
            const updatedUser = {
                id: user.id,
                name: name || user.name,
                email: email || user.email,
                phone: phone || user.phone, // Ajout du téléphone
                role: user.role,
                avatar: avatar || user.avatar,
                ...(password && { password }) // Mot de passe optionnel
            };

            // Dispatch de l'action updateUser
            dispatch(updateUser(updatedUser));

            // Mise à jour de la session si l'utilisateur modifie son propre profil
            if (currentUser?.id === user.id) {
                dispatch(connecter(updatedUser));
            }

            // Redirection selon le rôle
            setTimeout(() => {
                if (currentUser?.role === "admin") {
                    navigate("/dashboard/chef");
                } else if (currentUser?.role === "employee" || currentUser?.role === "employe") {
                    navigate("/dashboard/personnel");
                } else {
                    navigate("/dashboard/client");
                }
            }, 500);
        };

        // Gestion de l'image
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                saveUser(reader.result);
            };
            reader.onerror = () => {
                saveUser(user.avatar);
            };
            reader.readAsDataURL(file);
        } else {
            saveUser(user.avatar);
        }
    };

    // Formatage des données pour le formulaire
    const formData = {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '', // Ajout du téléphone
        password: '', // Ne pas afficher le mot de passe existant
        avatar: user.avatar || '',
        role: user.role || 'client'
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    {/* En-tête */}
                    <div className="text-center mb-4">
                        <div className="d-inline-block bg-primary bg-opacity-10 rounded-circle p-3 mb-3">
                            <i className="fas fa-user-edit fa-2x text-primary"></i>
                        </div>
                        <h2 className="fw-bold">Modifier l'utilisateur</h2>
                        <p className="text-muted">
                            {currentUser?.id === user.id 
                                ? "Modifiez vos informations personnelles" 
                                : "Modification du profil utilisateur"}
                        </p>
                    </div>

                    {/* Formulaire avec FormUser */}
                    <FormUser 
                        data={formData} 
                        btnText="Modifier" 
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                    />

                    {/* Informations supplémentaires pour l'admin */}
                    {currentUser?.role === 'admin' && currentUser?.id !== user.id && (
                        <div className="alert alert-info mt-4">
                            <i className="fas fa-info-circle me-2"></i>
                            Vous modifiez le profil de <strong>{user.name}</strong> (rôle: {user.role})
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}