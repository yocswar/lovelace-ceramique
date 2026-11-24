import { useState } from "react";
import Kanban from "../Kanban/Kanban";
import Chevron from "../Chevron/Chevron";
import "./Commandes.css";

// Affichage des commandes qui contient un kanban par commande avec ses tickets propres
function Commandes() {
  const [commandes, setCommandes] = useState([{ id: 17 }, { id: 18 }, { id: 19 }]);
  const [plies, setPlies] = useState({}); // { 17: true, 18: false, ... }
  const [message, setMessage] = useState("");

  function togglePlie(id) {
    setPlies((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
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
              <h2>Commande n°{commande.id}</h2>
            </header>

            <div style={{ display: plies[commande.id] ? "none" : "block" }}>
              <Kanban commandeId={commande.id} />
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

export default Commandes;