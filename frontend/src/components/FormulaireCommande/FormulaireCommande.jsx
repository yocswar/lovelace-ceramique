// FormulaireCommande.jsx : création d'une commande (nom du client + pièces à fabriquer)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../FormulaireConnexion/FormulaireConnexion";
import "./FormulaireCommande.css";

// Adapte si ton FormulaireConnexion utilise une URL de base différente (ex. variable d'environnement)
const API = "/api";

export default function FormulaireCommande() {
  const navigate = useNavigate();
  const [pieces, setPieces] = useState([]);
  const [nomClient, setNomClient] = useState("");
  const [lignes, setLignes] = useState([{ piece_id: "", quantite: 1 }]);
  const [erreur, setErreur] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const entetes = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };

  // Charge le catalogue de pièces au premier affichage
  useEffect(() => {
    fetch(`${API}/pieces`, { headers: entetes })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "ok") setPieces(data.pieces);
        else setErreur(data.message);
      })
      .catch(() => setErreur("Impossible de charger les pièces"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modifierLigne = (index, champ, valeur) =>
    setLignes((anciennes) =>
      anciennes.map((l, i) => (i === index ? { ...l, [champ]: valeur } : l))
    );

  const ajouterLigne = () =>
    setLignes((anciennes) => [...anciennes, { piece_id: "", quantite: 1 }]);

  const supprimerLigne = (index) =>
    setLignes((anciennes) => anciennes.filter((_, i) => i !== index));

  const envoyer = async (e) => {
    e.preventDefault();
    setErreur("");
    setEnvoiEnCours(true);

    try {
      const reponse = await fetch(`${API}/commandes`, {
        method: "POST",
        headers: entetes,
        body: JSON.stringify({
          nom_client: nomClient,
          pieces: lignes.map((l) => ({
            piece_id: Number(l.piece_id),
            quantite: Number(l.quantite),
          })),
        }),
      });
      const data = await reponse.json();

      if (data.status === "ok") {
        navigate("/"); // retour à la vue principale
      } else {
        setErreur(data.message);
      }
    } catch {
      setErreur("Impossible de joindre le serveur");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <main className="app">
    <header>
      <h1>Nouvelle commande</h1>
    </header>
    <section>
    <form className="commande-form" onSubmit={envoyer}>

      <label>
        Nom du client
        <input
          type="text"
          value={nomClient}
          maxLength={100}
          onChange={(e) => setNomClient(e.target.value)}
          required
        />
      </label>

      <h2>Pièces</h2>
      {lignes.map((ligne, index) => (
        <div key={index} className="commande-ligne">
          <select
            value={ligne.piece_id}
            onChange={(e) => modifierLigne(index, "piece_id", e.target.value)}
            required
          >
            <option value="">Choisir une pièce…</option>
            {pieces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            max={50}
            value={ligne.quantite}
            onChange={(e) => modifierLigne(index, "quantite", e.target.value)}
            required
          />

          {lignes.length > 1 && (
            <button type="button" onClick={() => supprimerLigne(index)}>
              Retirer
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={ajouterLigne}>
        + Ajouter une pièce
      </button>

      {erreur && <p role="alert">{erreur}</p>}

      <div className="commande-actions">
        <button type="submit" disabled={envoiEnCours}>
          {envoiEnCours ? "Création…" : "Créer la commande"}
        </button>
        <button type="button" onClick={() => navigate("/")}>
          Annuler
        </button>
      </div>
    </form>
    </section>
    </main>
  );
}
