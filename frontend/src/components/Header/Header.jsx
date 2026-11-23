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
            <>
              <Link to="/tableau-de-bord" className="btn btn--contour">
                Tableau de bord
              </Link>

              {/* Regroupe les actions réservées aux administrateurs. */}
              <details className="header_admin">
                <summary className="btn btn--contour">Administration</summary>

                <div className="header_admin-menu">
                  <Link to="/ajout-utilisateur" onClick={fermerMenu}>
                    Ajouter un utilisateur
                  </Link>
                </div>
              </details>
            </>
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
