import { useEffect, useState } from "react";
import "./Kanban.css";

// Kanban d'une commande (US.14). On glisse une carte dans n'importe quelle colonne pour changer son étape (US.12).
function Kanban({ commandeId }) {
  const [etapes, setEtapes] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [enCours, setEnCours] = useState(null); // carte en cours d'envoi au back
  const [ticketGlisse, setTicketGlisse] = useState(null); // carte en train d'être glissée
  const [colonneSurvolee, setColonneSurvolee] = useState(null); // colonne sous la souris pendant le glisser
  const [ticketPerdu, setTicketPerdu] = useState(null); // carte qui vient d'arriver en Perte : ouvre la modal

  // [commandeId] : on recharge si la commande change
  useEffect(() => {
    async function chargerKanban() {
      try {
        const response = await fetch("/api/tickets?id=" + commandeId);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Chargement impossible");
        }

        setEtapes(data.etapes);
        setTickets(data.tickets);
      } catch (error) {
        setMessage(error.message);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    }

    chargerKanban();
  }, [commandeId]);

  async function changerEtape(ticketId, etapeId) {
    setEnCours(ticketId);
    setMessage("");

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
      setMessage(data.message);
      setStatus("success");
      // US.13 : on se fie à la réponse du back, qui connaît le vrai nom de l'étape
      if (data.etape.nom === "Perte") {
        setTicketPerdu(tickets.find((ticket) => ticket.id === ticketId));
      }
    } catch (error) {
      setMessage(error.message);
      setStatus("error");
    } finally {
      setEnCours(null);
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
      setMessage(data.message);
      setStatus("success");
    } catch (error) {
      setMessage(error.message);
      setStatus("error");
    } finally {
      setTicketPerdu(null);
    }
  }

  function finGlisser() {
    setTicketGlisse(null);
    setColonneSurvolee(null);
  }

  if (loading) {
    return <p>Chargement de l&apos;atelier…</p>;
  }

  return (
    <section className="kanban-section">
      {message && (
        <p role="status" className={`connection-message ${status}`}>
          {message}
        </p>
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
                  <p className="kanban-artisan">{ticket.artisan ?? "Non assignée"}</p>
                </article>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Kanban;