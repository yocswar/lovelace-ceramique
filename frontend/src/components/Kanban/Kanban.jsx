import { useEffect, useState } from "react";
import "./Kanban.css";

// Kanban d'une commande (US.14). On glisse une carte vers la colonne suivante (US.12).
function Kanban({ commandeId }) {
  const [etapes, setEtapes] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [enCours, setEnCours] = useState(null); // carte en cours d'envoi au back
  const [ticketGlisse, setTicketGlisse] = useState(null); // carte en train d'être glissée

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

  async function passerEtapeSuivante(ticketId) {
    setEnCours(ticketId);
    setMessage("");

    try {
      const response = await fetch(`/api/tickets`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: ticketId }),
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
    } catch (error) {
      setMessage(error.message);
      setStatus("error");
    } finally {
      setEnCours(null);
    }
  }

  if (loading) {
    return <p>Chargement de l&apos;atelier…</p>;
  }

  // Colonne suivante de la carte glissée (-1 si rien n'est glissé)
  const indexSuivant = ticketGlisse
    ? etapes.findIndex((etape) => etape.id === ticketGlisse.etape_id) + 1
    : -1;

  return (
    <section className="kanban-section">
      <h2>Commandes à faire</h2>

      {message && (
        <p role="status" className={`connection-message ${status}`}>
          {message}
        </p>
      )}

      <div className="kanban">
        {etapes.map((etape, index) => {
          const cartes = tickets.filter((ticket) => ticket.etape_id === etape.id);

          return (
            <div
              key={etape.id}
              className={`kanban-colonne ${index === indexSuivant ? "kanban-colonne--cible" : ""}`}
              onDragOver={(event) => {
                // preventDefault = « j'accepte la carte », seulement sur la colonne suivante
                if (index === indexSuivant) event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                // dataTransfer stocke du texte : Number() le remet en nombre, comme ticket.id
                const ticketId = Number(event.dataTransfer.getData("text/plain"));
                setTicketGlisse(null);
                passerEtapeSuivante(ticketId);
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
                  onDragEnd={() => setTicketGlisse(null)}
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