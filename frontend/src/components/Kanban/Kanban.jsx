import { useCallback, useEffect, useState } from "react";
import Toast from "../Toast/Toast";
import "./Kanban.css";

// Kanban d'une commande (US.14). On glisse une carte dans n'importe quelle colonne pour changer son étape (US.12).
function Kanban({ commandeId, titre, actualiserStatut, statut }) {
  const [etapes, setEtapes] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [enCours, setEnCours] = useState(null); // carte en cours d'envoi au back
  const [ticketGlisse, setTicketGlisse] = useState(null); // carte en train d'être glissée
  const [colonneSurvolee, setColonneSurvolee] = useState(null); // colonne sous la souris pendant le glisser
  const [ticketPerdu, setTicketPerdu] = useState(null); // carte qui vient d'arriver en Perte : ouvre la modal
  const [ticketSelectionne, setTicketSelectionne] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState("");
  const [toast, setToast] = useState(null);
  const [modalFinalisation, setModalFinalisation] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000); // disparaît après 3 s
  };

  const chargerUtilisateurs = () => {
    fetch("/api/utilisateurs", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(response => response.json())
      .then(data => setUtilisateurs(data.utilisateurs));
  };

  const chargerKanban = useCallback(async () => {
    try {
      const response = await fetch("/api/tickets?id=" + commandeId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Chargement impossible");
      }

      setEtapes(data.etapes);
      setTickets(data.tickets);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setLoading(false);
    }
  }, [commandeId]);

  // [commandeId] : on recharge si la commande change
  useEffect(() => {
    chargerKanban();
  }, [chargerKanban])

  async function changerEtape(ticketId, etapeId) {
    setEnCours(ticketId);

    try {
      const response = await fetch(`/api/tickets`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: ticketId, etape_id: etapeId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Changement d'étape impossible");
      }

      // Mise à jour locale : la carte change de colonne sans recharger la page
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, etape_id: data.etape.id } : ticket,
        ),
      );

      actualiserStatut(commandeId, data.statut_commande);

      showToast("success", data.message);
      // US.13 : on se fie à la réponse du back, qui connaît le vrai nom de l'étape
      if (data.etape.nom === "Perte") {
        setTicketPerdu(tickets.find((ticket) => ticket.id === ticketId));
      }
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setEnCours(null);
    }
  }

  async function finaliserCommande() {
    try {
      const response = await fetch("/api/commandes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ id: commandeId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      actualiserStatut(commandeId, "terminee");

    } catch (error) {
      showToast("error", error.message);
    }
  }

  async function recreerPiece() {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticketPerdu.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Recréation impossible");
      }

      // Copie locale de la carte perdue : pas besoin de recharger tout le Kanban.
      // etapes[0] = "À faire", car le back renvoie les étapes triées par ordre.
      const nouvelleCarte = { ...ticketPerdu, id: data.ticket_id, etape_id: etapes[0].id, artisan: null };
      setTickets((prev) => [...prev, nouvelleCarte]);

      actualiserStatut(commandeId, "en_cours");

      showToast("success", data.message);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setTicketPerdu(null);
    }
  }

  function finGlisser() {
    setTicketGlisse(null);
    setColonneSurvolee(null);
  }

  async function assignerUtilisateur() {
    const response = await fetch("/api/tickets/assignation", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({
        id: ticketSelectionne.id,
        utilisateur_id: utilisateurSelectionne === "aucun"
          ? null
          : Number(utilisateurSelectionne)
      })
    });

    if (response.ok) {
      showToast(
        "success",
        utilisateurSelectionne === "aucun" ? "Utilisateur désassigné !" : "Utilisateur assigné !"
      );
      chargerKanban(); // Recharge les tickets
      setTicketSelectionne(null); // Sort de la modal
    } else {
      showToast("error", "Erreur lors de l'assignation");
    }
  }

  function calculerProgressionTicket(ticket) {

    const etapesFabrication = etapes.filter(
      (etape) => etape.nom !== "Perte"
    );

    const indexEtape = etapesFabrication.findIndex(
      (etape) => etape.id === ticket.etape_id
    );

    if (indexEtape === -1 || etapesFabrication.length <= 1) {
      return 0;
    }

    return (indexEtape / (etapesFabrication.length - 1)) * 100;
  }

  function calculerProgressionCommande() {
    if (tickets.length === 0) {
      return 0;
    }

    let progressionTotale = 0;

    tickets.forEach((ticket) => {
      progressionTotale += calculerProgressionTicket(ticket);
    });

    return progressionTotale / tickets.length;
  }

  const progressionCommande = calculerProgressionCommande();

  const etapePerte = etapes.find(
    (etape) => etape.nom === "Perte"
  );

  const nombreTicketsPerdus = tickets.filter(
    (ticket) => ticket.etape_id === etapePerte?.id
  ).length;

  if (loading) {
    return <p>Chargement de l&apos;atelier…</p>;
  }

  return (
    <section className="kanban-section">
      <header className="commande-header">
        <h2>{titre}</h2>

        <div className="progression-commande">
          <progress
            value={progressionCommande}
            max={100}
          />
          <span>{Math.round(progressionCommande)}%</span>
        </div>

        {statut === "a_finaliser" && (
          <button
            className="bouton-finaliser"
            type="button"
            onClick={() => setModalFinalisation(true)}
          >
            Finaliser la commande
          </button>
        )}
      </header>
      {message && (
        <p role="status" className={`connection-message ${status}`}>
          {message}
        </p>
      )}

      {modalFinalisation && (
        <div className="modal-fond">
          <div className="modal" role="dialog" aria-modal="true">
            <h3>Finaliser la commande</h3>

            <p>Voulez-vous vraiment finaliser cette commande ?</p>

            {nombreTicketsPerdus > 0 && (
              <p className="avertissement-perte">
                Attention : cette commande contient {nombreTicketsPerdus}
                {" "}pièce(s) perdue(s).
              </p>
            )}

            <p>
              Une fois finalisée, cette commande ne sera
              plus visible dans la liste des commandes actives.
            </p>

            <button type="button" onClick={finaliserCommande}>
              Confirmer
            </button>

            <button
              type="button"
              onClick={() => setModalFinalisation(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {ticketPerdu && (
        <div className="modal-fond">
          <div className="modal" role="dialog" aria-modal="true">
            <p>
              " {ticketPerdu.piece} " est perdue. Recréer la pièce dans "À faire" ?
            </p>
            <button onClick={recreerPiece}>Oui, recréer</button>
            <button onClick={() => setTicketPerdu(null)}>Non</button>
          </div>
        </div>
      )}

      <div className="kanban">
        {etapes.map((etape) => {
          const cartes = tickets.filter((ticket) => ticket.etape_id === etape.id);
          // Toutes les colonnes acceptent la carte, sauf celle où elle est déjà
          const estCible = ticketGlisse !== null && ticketGlisse.etape_id !== etape.id;

          return (
            <div
              key={etape.id}
              className={`kanban-colonne ${estCible && colonneSurvolee === etape.id ? "kanban-colonne--cible" : ""}`}
              onDragOver={(event) => {
                if (!estCible) return;
                event.preventDefault(); // preventDefault = « j'accepte la carte ici »
                setColonneSurvolee(etape.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                // dataTransfer stocke du texte : Number() le remet en nombre, comme ticket.id
                const ticketId = Number(event.dataTransfer.getData("text/plain"));
                finGlisser();
                changerEtape(ticketId, etape.id);
              }}
            >
              <h3>
                {etape.nom}
                <span className="kanban-compteur">{cartes.length}</span>
              </h3>

              {cartes.map((ticket) => (
                <article
                  key={ticket.id}
                  className={`kanban-carte ${enCours === ticket.id ? "kanban-carte--en-cours" : ""}`}
                  draggable={enCours !== ticket.id} // pas de nouveau glisser pendant l'envoi
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", String(ticket.id));
                    // dataTransfer n'est pas lisible pendant le survol : on garde la carte dans un état
                    setTicketGlisse(ticket);
                  }}
                  onDragEnd={finGlisser}
                >
                  <p className="kanban-piece">{ticket.piece}</p>
                  <p>
                    Commande n°{ticket.commande_id} · {ticket.nom_client}
                  </p>
                  <button
                    className="kanban-artisan"
                    onClick={() => {
                      setTicketSelectionne(ticket);
                      setUtilisateurSelectionne("");
                      chargerUtilisateurs();
                    }}
                  >
                    {ticket.artisan ?? "Non assignée"}
                  </button>
                </article>
              ))}
            </div>
          );
        })}
      </div>
      {ticketSelectionne && (
        <div className="modal-fond">
          <div className="modal">
            <h3>Assigner un utilisateur</h3>

            <p>Ticket : {ticketSelectionne.piece}</p>

            <select
              value={utilisateurSelectionne}
              onChange={(e) => setUtilisateurSelectionne(e.target.value)}
            >
              <option value="">Choisir un utilisateur</option>
              <option value="aucun">Aucun utilisateur (désassigner)</option>

              {utilisateurs.map(utilisateur => (
                <option key={utilisateur.id} value={utilisateur.id}>
                  {utilisateur.nom}
                </option>
              ))}
            </select>

            <button
              disabled={!utilisateurSelectionne}
              onClick={assignerUtilisateur}
            >
              Assigner
            </button>

            <button onClick={() => setTicketSelectionne(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
      {toast && <Toast type={toast.type} message={toast.message} />}
    </section>
  );
}

export default Kanban;