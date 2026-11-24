import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Commandes from "../Commandes/Commandes";
import "./Accueil.css";
import IconePlus from "../IconePlus/IconePlus";

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
      <section className="accueil-section">
        <button type="button" className="btn btn--plein" onClick={() => navigate("/creation-commande")}>
          <IconePlus />
          Nouvelle commande
        </button>
      </section>
      <Commandes/>
    </main>
  );
}

export default Accueil;
