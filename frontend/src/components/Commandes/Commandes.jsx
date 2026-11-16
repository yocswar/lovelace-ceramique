import { useState, useEffect } from "react";
import { getToken } from "../FormulaireConnexion/FormulaireConnexion";
import Kanban from "../Kanban/Kanban";
import "./Commandes.css";

//Affichage des commandes qui contient un kanban par commande avec ses tickets propres
function Commandes() {
    const [commandes, setCommandes] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [message, setMessage] = useState("");

    const entetes = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      };

    useEffect(() => {
        async function chargerCommande() {
            try {
                const response = await fetch("/api/commandes", {
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
        },[])


    return (
        <>
        <section className="commande-section">

            {message && <p>{message}</p>}

            {commandes.map((commande) => (
                <article  key={commande.id} className="commande-carte">
                    
                    <header className="commande-header">
                        <h2> Commande n°{commande.id}</h2>
                    </header>

                    <Kanban commandeId={commande.id}/>
                </article>
            ))}
        </section>
        </>
        );
}

export default Commandes;