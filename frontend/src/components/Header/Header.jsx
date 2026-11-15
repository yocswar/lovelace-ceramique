import { Link, useNavigate } from "react-router-dom";
import LogoPotterPilot from "../LogoPotterPilot/LogoPotterPilot.jsx";
import "./Header.css";

function Header() {
    const navigate = useNavigate();

    // Récupérer les informations de l'utilisateur connecté
    const utilisateur = JSON.parse(
        localStorage.getItem("utilisateur") || "null"
    );

    // Récupérer son nom
    const nomUtilisateur = utilisateur?.nom || "Utilisateur";

    // Déconnexion de l'utilisateur
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
                        Tableau de bord
                    </Link>

                    <span className="header_separator"></span>

                    <span className="header_user">
                        {nomUtilisateur}
                    </span>

                    <span className="header_separator"></span>

                    <button type="button" className="btn btn--contour" onClick={seDeconnecter}>
                        Se déconnecter
                    </button>
                </nav>
            </div>  
        </header>
    );
}

export default Header;
