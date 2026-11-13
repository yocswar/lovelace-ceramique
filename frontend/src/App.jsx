// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import FormulaireConnexion, { getToken } from "./components/FormulaireConnexion/FormulaireConnexion";
import Accueil from "./components/Accueil/Accueil";
import Header from "./components/Header/Header";
import FormulaireCommande from "./components/FormulaireCommande/FormulaireCommande";
import "./App.css";

// Bloque l'accès aux pages privées si l'utilisateur n'a pas de token
function RouteProtegee({ children }) {
  if (!getToken()) {
    return <Navigate to="/connexion" replace />;
  }

  // Ajout d'un return pour afficher unniquement le header quand l'utilisateur est connectée
  return (
    <>
      <Header />
      {children}
    </>
  );
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
