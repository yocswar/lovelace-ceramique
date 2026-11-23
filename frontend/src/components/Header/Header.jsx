import { Link, useNavigate } from "react-router-dom";
import LogoPotterPilot from "../LogoPotterPilot/LogoPotterPilot.jsx";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  // Récupère les informations du compte connecté.
  const utilisateur = JSON.parse(localStorage.getItem("utilisateur") || "null");

  const nomUtilisateur = utilisateur?.nom || "Utilisateur";
  const estAdministrateur = utilisateur?.role === "Administrateur";

  // Ferme le menu après le choix d'une action.
  function fermerMenu(event) {
    event.currentTarget.closest("details").open = false;
  }

  function seDeconnecter() {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");

    navigate("/connexion", { replace: true });
  }

  return (
    <header className="pp-header">
      <div className="main">
        <Link
          to="/"
          className="header_logo"
          aria-label="PotterPilot — Accueil Kanban"
        >
          <LogoPotterPilot />
          <h1 className="fc-nom-appli">PotterPilot</h1>
        </Link>

        <nav className="header_nav" aria-label="Navigation principale">
          {estAdministrateur && (
            <details className="header_admin">
              <summary className="btn btn--contour">Administration</summary>

              {/* Regroupe les pages et les actions d'administration. */}
              <div className="header_admin-menu">
                <Link to="/tableau-de-bord" onClick={fermerMenu}>
                  Tableau de bord
                </Link>

                <Link to="/ajout-utilisateur" onClick={fermerMenu}>
                  Ajouter un collaborateur
                </Link>
              </div>
            </details>
          )}

          <span className="header_separator" aria-hidden="true"></span>

          <span className="header_user">{nomUtilisateur}</span>

          <span className="header_separator" aria-hidden="true"></span>

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
