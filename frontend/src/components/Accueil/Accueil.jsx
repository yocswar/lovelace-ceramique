import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InscriptionForm from "../InscriptionForm/InscriptionForm";
import FormulaireConnexion from "../FormulaireConnexion/FormulaireConnexion";
import Kanban from "../Kanban/Kanban";

function Accueil() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [utilisateur, setUtilisateur] = useState([]);

  async function verifierConnexion() {
    setLoading(true);
    setMessage("");
    setStatus("");

    try {
      const response = await fetch("/api/healthcheck", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Erreur de connexion au serveur");
      }

      const data = await response.json();

      if (data.status === "ok" && data.database === "connected") {
        setMessage(data.message);
        setStatus("success");
      } else {
        throw new Error("La base de données est indisponible");
      }
    } catch (error) {
      setMessage(error.message);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  async function getUtilisateur() {
    setLoading(true);
    setMessage("");
    setStatus("");

    try {
      const response = await fetch("/api/utilisateur", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }

      const data = await response.json();

      if (data.status === "ok" && data.database === "connected") {
        setMessage(data.message);
        setStatus("success");
        setUtilisateur(data.result);
      } else {
        throw new Error("La base de données est indisponible");
      }
    } catch (error) {
      setMessage(error.message);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header>
        <h1>Lovelace Céramique</h1>
        <p>Gestion de production pour les ateliers de céramique</p>
      </header>

      <section>
        <h2>Bienvenue dans votre atelier</h2>

        <p>
          Suivez vos objets, vos étapes de fabrication et vos tâches de
          production.
        </p>

        <button type="button" onClick={() => navigate("/commandes/nouvelle")}>
          Nouvelle commande
        </button>

        <button type="button" onClick={verifierConnexion} disabled={loading}>
          {loading ? "Vérification..." : "Vérifier la connexion"}
        </button>

        {message && (
          <p role="status" className={`connection-message ${status}`}>
            {message}
          </p>
        )}

        <button type="button" onClick={getUtilisateur} disabled={loading}>
          {loading ? "Récupération..." : "Récupérer les utilisateurs"}
        </button>

        {message && (
          <p role="status" className={`connection-message ${status}`}>
            {message}
          </p>
        )}

        {utilisateur.length > 0 && (
          <div>
            <h3>Liste des utilisateurs :</h3>
            <ul>
              {utilisateur.map((utilisateur) => (
                <li key={utilisateur.id}>
                  {utilisateur.nom} - {utilisateur.email}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <Kanban commandeId={32} />
      <InscriptionForm/>
    </main>
  );
}

export default Accueil;
