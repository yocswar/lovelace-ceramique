import { Link } from "react-router-dom";

export default function TableauDeBord() {
  return (
    <main className="app">
      <h1>Tableau de bord</h1>

      {/* Accès aux fonctionnalités d'administration. */}
      <nav aria-label="Actions d'administration">
        <Link to="/ajout-utilisateur" className="btn btn--plein">
          Ajouter un utilisateur
        </Link>
      </nav>
    </main>
  );
}
