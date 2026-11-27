import { useState, useEffect } from "react";
import { getToken } from "../FormulaireConnexion/FormulaireConnexion";
import Kanban from "../Kanban/Kanban";
import Chevron from "../Chevron/Chevron";
import AjouterPieceModal from "../AjouterPieceModal/AjouterPieceModal";
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
    const [message, setMessage] = useState("")
    const [plies, setPlies] = useState({}); // { 17: true, 18: false, ... }
    const [commandeModale, setCommandeModale] = useState(null); // commande pour laquelle la modale « + » est ouverte
    const [versions, setVersions] = useState({}); // { 17: 2, ... } sert à recharger le Kanban d'une commande

    function togglePlie(id) {
    setPlies((prev) => ({ ...prev, [id]: !prev[id] }));
    }

  // Après l'ajout d'une pièce : on déplie la commande et on recharge son Kanban
  // (changer la key de <Kanban> le remonte, donc il refait son fetch sans modifier Kanban.jsx)
  function pieceAjoutee(commandeId) {
    setPlies((prev) => ({ ...prev, [commandeId]: false }));
    setVersions((prev) => ({ ...prev, [commandeId]: (prev[commandeId] ?? 0) + 1 }));
    }
    // Récupérer les informations de l'utilisateur connecté
    const utilisateur = JSON.parse(
        localStorage.getItem("utilisateur") || "null"
    );

    const entetes = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };

    useEffect(() => {
        async function chargerCommande() {
            try {
                if (!utilisateur) {
                    throw new Error("Erreur lors de la récupération des informations de l'utilisateur");
                }
                const response = await fetch("/api/commandes?id=" + utilisateur.organisation_id, {
                    method: "GET",
                    headers: entetes
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Une erreur s'est produite");
                }

                setCommandes(data.commandes);

            } catch (error) {
                setMessage(error.message);
            } finally {
                setChargement(false)
            }
        }
        chargerCommande();
    }, [])

    // Actualiser le statut d'une commande
    function actualiserStatut(commandeId, nouveauStatut) {

        if (nouveauStatut === "terminee") {
            setCommandes((prev) =>
                prev.filter((commande) => commande.id !== commandeId)
            );
            return;
        }

        setCommandes((prev) =>
            prev.map((commande) =>
                commande.id === commandeId
                    ? { ...commande, statut: nouveauStatut }
                    : commande
            )
        );
    }

    return (
        <>
            <section className="commande-section">

                {message && <p>{message}</p>}

                {commandes.map((commande) => (
                    <article key={commande.id} className="commande-carte">

                        <Kanban
                            commandeId={commande.id}
                            titre={`Commande n°${commande.id} - ${commande.nom_client} - ${affichageStatut(commande.statut)}`}
                            actualiserStatut={actualiserStatut}
                            statut={commande.statut}
                        />

                    </article>
                ))}
            </section>
        </>
    );
}

function affichageStatut(statut) {
    switch (statut) {
        case "a_faire":
            return "À faire";
        case "en_cours":
            return "En cours";
        case "a_finaliser":
            return "À finaliser";
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
            <button
              type="button"
              className="ajout-piece-bouton"
              onClick={() => setCommandeModale(commande)}
              aria-label={"Ajouter une pièce à la commande n°" + commande.id}
              title="Ajouter une pièce"
            >
              +
            </button>
          </header>

          <div style={{ display: plies[commande.id] ? "none" : "block" }}>
            <Kanban key={versions[commande.id] ?? 0} commandeId={commande.id} />
          </div>
        </article>
      ))}

      {commandeModale && (
        <AjouterPieceModal
          commande={commandeModale}
          onClose={() => setCommandeModale(null)}
          onCreated={() => pieceAjoutee(commandeModale.id)}
        />
      )}
    </section>
  );
}

export default Commandes;
