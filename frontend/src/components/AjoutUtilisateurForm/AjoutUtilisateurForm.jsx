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

  function modifierChamp(event) {
    const { name, value } = event.target;

    setChamps((champsPrecedents) => ({
      ...champsPrecedents,
      [name]: value,
    }));
  }

  function soumettre(event) {
    event.preventDefault();

    const donnees = {
      nom: champs.nom.trim(),
      identifiant: champs.identifiant.trim(),
      email: champs.email.trim(),
      mdp: champs.mdp,
      role: champs.role,
    };

    console.log({
      nom: donnees.nom,
      identifiant: donnees.identifiant,
      email: donnees.email,
      role: donnees.role,
    });
  }

  return (
    <form onSubmit={soumettre}>
      <h2>Ajouter un utilisateur</h2>

      <label>
        Nom
        <input
          name="nom"
          value={champs.nom}
          onChange={modifierChamp}
          maxLength={50}
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
          required
        />
      </label>

      <label>
        Rôle
        <select name="role" value={champs.role} onChange={modifierChamp}>
          <option value="Collaborateur">Collaborateur</option>
        </select>
      </label>

      <button type="submit">Créer le compte</button>
    </form>
  );
}
