// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import FormulaireConnexion, { getToken } from "./components/FormulaireConnexion/FormulaireConnexion";
import Accueil from "./components/Accueil/Accueil";
import FormulaireCommande from "./components/FormulaireCommande/FormulaireCommande";
import "./App.css";

// Bloque l'accès aux pages privées si l'utilisateur n'a pas de token
function RouteProtegee({ children }) {
  return getToken() ? children : <Navigate to="/connexion" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<FormulaireConnexion />} />
      <Route path="/" element={<RouteProtegee><Accueil /></RouteProtegee>} />
      <Route
        path="/commandes/nouvelle"
        element={<RouteProtegee><FormulaireCommande /></RouteProtegee>}
      />
      <Route path="*" element={<p>Page introuvable</p>} />
    </Routes>
  );
}
