import { Link, useNavigate } from "react-router-dom";
import LogoPotterPilot from "../LogoPotterPilot/LogoPotterPilot.jsx";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  // Récupère les informations du compte connecté.
  const utilisateur = JSON.parse(localStorage.getItem("utilisateur") || "null");

  const nomUtilisateur = utilisateur?.nom || "Utilisateur";
  const estAdministrateur = utilisateur?.role === "Administrateur";

  // Supprime les informations de connexion et ouvre la page de connexion.
  function seDeconnecter() {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");

    navigate("/connexion", { replace: true });
  }

  return (
    <header className="pp-header">
      <div className="main">
        <Link to="/" className="header_logo">
          <LogoPotterPilot />
          <h1 className="fc-nom-appli">PotterPilot</h1>
        </Link>

        <nav className="header_nav">
          <Link to="/" className="btn btn--contour">
            Kanban
          </Link>

          {/* Affiche l'accès au tableau de bord pour les administrateurs. */}
          {estAdministrateur && (
            <Link to="/tableau-de-bord" className="btn btn--contour">
              Tableau de bord
            </Link>
          )}

          <span className="header_separator"></span>

          <span className="header_user">{nomUtilisateur}</span>

          <span className="header_separator"></span>

          <button
            type="button"
            className="btn btn--contour"
            onClick={seDeconnecter}
          >
            Se déconnecter
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
