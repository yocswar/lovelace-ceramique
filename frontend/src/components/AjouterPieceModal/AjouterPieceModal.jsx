import { useState, useEffect } from "react";
import { getToken } from "../FormulaireConnexion/FormulaireConnexion";
import "./AjouterPieceModal.css";

// Modale d'ajout d'une pièce à une commande (bouton « + » du header).
// Props : commande { id, nom_client }, onClose(), onCreated()
function AjouterPieceModal({ commande, onClose, onCreated }) {
  const [pieces, setPieces] = useState([]);
  const [pieceId, setPieceId] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // Le catalogue de pièces alimente le menu déroulant (GET /api/pieces)
  useEffect(() => {
    async function chargerPieces() {
      try {
        const response = await fetch("/api/pieces", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Impossible de charger les pièces");
        }
        setPieces(data.pieces);
      } catch (error) {
        setMessage(error.message);
      }
    }

    chargerPieces();
  }, []);

  // Échap = Annuler
  useEffect(() => {
    function surTouche(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onClose]);

  async function valider(e) {
    e.preventDefault();
    setMessage("");

    if (!pieceId) {
      setMessage("Choisissez un type de pièce.");
      return;
    }
    if (!Number.isInteger(quantite) || quantite < 1) {
      setMessage("La quantité doit être d'au moins 1.");
      return;
    }

    setEnvoi(true);
    try {
      const response = await fetch("/api/tickets/ajout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          commande_id: commande.id,
          piece_id: Number(pieceId),
          quantite,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur s'est produite");
      }

      onCreated();
      onClose();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="modale-fond" onClick={onClose}>
      <form
        className="modale"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modale-titre"
        onClick={(e) => e.stopPropagation()}
        onSubmit={valider}
      >
        <h2 id="modale-titre">Ajouter une pièce à la commande n°{commande.id}</h2>

        <label>
          Nom du client
          <input type="text" value={commande.nom_client} readOnly />
        </label>

        <label>
          Type de pièce
          <select value={pieceId} onChange={(e) => setPieceId(e.target.value)} required>
            <option value="">— Sélectionner —</option>
            {pieces.map((piece) => (
              <option key={piece.id} value={piece.id}>
                {piece.nom}
              </option>
            ))}
          </select>
        </label>

        <label>
          Quantité
          <input
            type="number"
            min="1"
            max="50"
            value={quantite}
            onChange={(e) => setQuantite(parseInt(e.target.value, 10))}
            required
          />
        </label>

        {message && <p className="modale-erreur">{message}</p>}

        <div className="modale-actions">
          <button type="button" onClick={onClose} disabled={envoi}>
            Annuler
          </button>
          <button type="submit" disabled={envoi}>
            {envoi ? "Création…" : "Valider"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AjouterPieceModal;