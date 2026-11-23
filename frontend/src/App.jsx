// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import FormulaireConnexion, {
  getToken,
} from "./components/FormulaireConnexion/FormulaireConnexion";
import FormulaireOrganisation from "./components/FormulaireOrganisation/FormulaireOrganisation";
import Accueil from "./components/Accueil/Accueil";
import Header from "./components/Header/Header";
import FormulaireCommande from "./components/FormulaireCommande/FormulaireCommande";
import TableauDeBord from "./components/TableauDeBord/TableauDeBord";
import AjoutUtilisateurForm from "./components/AjoutUtilisateurForm/AjoutUtilisateurForm";
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

// Réserve les pages d'administration aux comptes administrateurs.
function RouteAdministrateur({ children }) {
  let utilisateur = null;

  try {
    utilisateur = JSON.parse(localStorage.getItem("utilisateur") || "null");
  } catch {
    return <Navigate to="/connexion" replace />;
  }

  if (utilisateur?.role !== "Administrateur") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/creation-organisation"
        element={<FormulaireOrganisation />}
      />
      <Route path="/connexion" element={<FormulaireConnexion />} />
      <Route
        path="/"
        element={
          <RouteProtegee>
            <Accueil />
          </RouteProtegee>
        }
      />
      <Route
        path="/creation-commande"
        element={
          <RouteProtegee>
            <FormulaireCommande />
          </RouteProtegee>
        }
      />
      <Route
        path="/tableau-de-bord"
        element={
          <RouteProtegee>
            <RouteAdministrateur>
              <TableauDeBord />
            </RouteAdministrateur>
          </RouteProtegee>
        }
      />

      <Route
        path="/ajout-utilisateur"
        element={
          <RouteProtegee>
            <RouteAdministrateur>
              <main className="app">
                <AjoutUtilisateurForm />
              </main>
            </RouteAdministrateur>
          </RouteProtegee>
        }
      />
      <Route path="*" element={<p>Page introuvable</p>} />
    </Routes>
  );
}
