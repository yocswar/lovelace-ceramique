import { useState, useEffect } from "react";
import { getToken } from "../FormulaireConnexion/FormulaireConnexion";
import Kanban from "../Kanban/Kanban";
import Chevron from "../Chevron/Chevron";
import "./Commandes.css";

function affichageStatut(statut) {
  switch (statut) {
    case "a_faire":
      return "À faire";
    case "en_cours":
      return "En cours";
    default:
      return statut ?? "";
  }
}

// Affichage des commandes qui contient un kanban par commande avec ses tickets propres
function Commandes() {
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [plies, setPlies] = useState({}); // { 17: true, 18: false, ... }
  const [message, setMessage] = useState("");

  function togglePlie(id) {
    setPlies((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  useEffect(() => {
    async function chargerCommande() {
      try {
        // Récupérer les informations de l'utilisateur connecté
        const utilisateur = JSON.parse(localStorage.getItem("utilisateur") || "null");

        if (!utilisateur) {
          throw new Error("Erreur lors de la récupération des informations de l'utilisateur");
        }

        const response = await fetch("/api/commandes?id=" + utilisateur.organisation_id, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Une erreur s'est produite");
        }

        setCommandes(data.commandes);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setChargement(false);
      }
    }

    chargerCommande();
  }, []);

  if (chargement) {
    return <p>Chargement des commandes…</p>;
  }

  return (
    <section className="commande-section">
      {message && <p>{message}</p>}

      {commandes.map((commande) => (
        <article key={commande.id} className="commande-carte">
          <header className="commande-header">
            <button
              type="button"
              className="chevron-bouton"
              onClick={() => togglePlie(commande.id)}
              aria-expanded={!plies[commande.id]}
              aria-label={plies[commande.id] ? "Déplier la commande" : "Replier la commande"}
            >
              <Chevron plie={!!plies[commande.id]} />
            </button>
            <h2>
              Commande n°{commande.id} - {commande.nom_client} - {affichageStatut(commande.statut)}
            </h2>
          </header>

          <div style={{ display: plies[commande.id] ? "none" : "block" }}>
            <Kanban commandeId={commande.id} />
          </div>
        </article>
      ))}
    </section>
  );
}

export default Commandes;
