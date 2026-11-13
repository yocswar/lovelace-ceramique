import { Link, useNavigate } from "react-router-dom";
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
            <Link to="/" className="header_logo">
                <img src="images/Logo_terracotta_Pottery_Pilot.png" alt="PotterPilot"/>
            </Link>

            <nav className="header_nav">
                <Link to="/" className="header_button">
                    Tableau de bord
                </Link>

                <span className="header_separator"></span>

                <span className="header_user">
                    {nomUtilisateur}
                </span>

                <span className="header_separator"></span>

                <button type="button" className="header_button" onClick={seDeconnecter}>
                    Se déconnecter
                </button>
            </nav>
        </header>
    );
}

export default Header;
