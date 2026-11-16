import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Commandes from "../Commandes/Commandes";
import "./Accueil.css";
import IconePlus from "../IconePlus/IconePlus";
import FormulaireCommande from "../FormulaireCommande/FormulaireCommande";

function Accueil() {
  const location = useLocation();
  // true = on affiche le formulaire de création à la place de l'accueil (l'adresse reste « / »)
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [utilisateur, setUtilisateur] = useState([]);

  // Un clic sur un lien vers « / » (ex. « Retour à l'accueil » du Header) ferme le formulaire :
  // location.key change à chaque navigation, même vers l'adresse où l'on est déjà
  useEffect(() => {
    setAfficherFormulaire(false);
  }, [location.key]);

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

  if (afficherFormulaire) {
    return (
      <FormulaireCommande
        onCreee={() => setAfficherFormulaire(false)}
        onAnnuler={() => setAfficherFormulaire(false)}
      />
    );
  }

  return (
    <main className="app">
      <section className="accueil-section">
        <button type="button" className="btn btn--plein" onClick={() => setAfficherFormulaire(true)}>
          <IconePlus />
          Nouvelle commande
        </button>
      </section>
      <Commandes/>
    </main>
  );
}

export default Accueil;
