
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Inscription from './pages/Inscription';
import DashboardClient from './pages/DashboardClient';
import Profil from './components/Profile';
import DashboardPerso from './pages/DashboardPerso';
import ModifierUtilisateur from './components/ModifierUtilisateur';
import InspectionVoiture from './components/InspectionVoiture';
import DashboardChef from './pages/DashboardChef';
import GestionVoitures from './components/gestionVoitures';
import ModifierVoiture from './components/ModifierVoiture';
import AjouterVoiture from './components/AjouterVoiture';
import NotFound from './pages/NotFound';
import AjouterUser from './components/AjouterUser';

function App() {
  return (
    <div className="App">
     <BrowserRouter>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/dashboard/client" element={<DashboardClient />} />
        <Route path="/profile/:id" element={<Profil />} />
        <Route path="/dashboard/personnel" element={<DashboardPerso />} />
        <Route path="/modifierUtilisateur/:id/:role" element={<ModifierUtilisateur />} />
        <Route path="/inspectionVoiture/:resId" element={<InspectionVoiture />} />
        <Route path="/retourVoiture/:resId" element={<InspectionVoiture />} />
        <Route path="/dashboard/chef" element={<DashboardChef />} />
        <Route path="/gestionVoitures" element={<GestionVoitures />} />
        <Route path="/modifierVoiture/:id" element={<ModifierVoiture />} />
        <Route path="/ajouterVoiture" element={<AjouterVoiture />} />
        <Route path="/ajouterUser/:role" element={<AjouterUser />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
     </BrowserRouter>
    </div>
  );
}

export default App;
