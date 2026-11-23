import { useState } from "react";

const champsInitiaux = {
  nom: "",
  identifiant: "",
  email: "",
  mdp: "",
  role: "Collaborateur",
};

export default function AjoutUtilisateurForm() {
  const [champs, setChamps] = useState(champsInitiaux);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  function modifierChamp(event) {
    const { name, value } = event.target;

    setChamps((champsPrecedents) => ({
      ...champsPrecedents,
      [name]: value,
    }));
  }

  async function soumettre(event) {
    event.preventDefault();

    if (chargement) {
      return;
    }

    setChargement(true);
    setMessage("");
    setErreur("");

    // Prépare les données du compte. Le serveur fixe le rôle.
    const donnees = {
      nom: champs.nom.trim(),
      identifiant: champs.identifiant.trim(),
      email: champs.email.trim(),
      mdp: champs.mdp,
    };

    try {
      // Envoie les données avec le token de l'utilisateur connecté.
      const reponse = await fetch("/api/ajout/utilisateurs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(donnees),
      });

      const resultat = await reponse.json();

      if (!reponse.ok) {
        const details = resultat.erreurs?.join(" ");

        setErreur(details || resultat.message || "Création impossible");
        return;
      }

      // Confirme la création et vide les champs après la réussite.
      setMessage(resultat.message);
      setChamps(champsInitiaux);
    } catch {
      setErreur(
        "Impossible de joindre le serveur ou de lire sa réponse. Vérifiez la création avant de réessayer.",
      );
    } finally {
      // Réactive le formulaire après chaque tentative.
      setChargement(false);
    }
  }

  return (
    <form onSubmit={soumettre} aria-busy={chargement}>
      <h2>Ajouter un utilisateur</h2>

      <label>
        Nom
        <input
          name="nom"
          value={champs.nom}
          onChange={modifierChamp}
          maxLength={50}
          disabled={chargement}
          required
        />
      </label>

      <label>
        Identifiant
        <input
          name="identifiant"
          value={champs.identifiant}
          onChange={modifierChamp}
          maxLength={25}
          disabled={chargement}
          required
        />
      </label>

      <label>
        E-mail
        <input
          type="email"
          name="email"
          value={champs.email}
          onChange={modifierChamp}
          maxLength={120}
          disabled={chargement}
          required
        />
      </label>

      <label>
        Mot de passe
        <input
          type="password"
          name="mdp"
          value={champs.mdp}
          onChange={modifierChamp}
          autoComplete="new-password"
          minLength={8}
          disabled={chargement}
          required
        />
      </label>

      <label>
        Rôle
        <select
          name="role"
          value={champs.role}
          onChange={modifierChamp}
          disabled={chargement}
        >
          <option value="Collaborateur">Collaborateur</option>
        </select>
      </label>

      <button type="submit" disabled={chargement}>
        {chargement ? "Création..." : "Créer le compte"}
      </button>

      {message && <p role="status">{message}</p>}
      {erreur && <p role="alert">{erreur}</p>}
    </form>
  );
}
