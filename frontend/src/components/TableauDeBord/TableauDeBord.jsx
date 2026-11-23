import "./TableauDeBord.css";

export default function TableauDeBord() {
  return (
    <main className="app tableau-de-bord">
      <h1>Tableau de bord</h1>

      {/* Aperçu de la présentation avant la connexion à l'API. */}
      <p className="tableau-de-bord__information">
        Aperçu du tableau de bord. Les données seront disponibles prochainement.
      </p>

      <section
        className="tableau-de-bord__statistiques"
        aria-label="Indicateurs de production"
      >
        <article className="tableau-de-bord__carte">
          <h2>Commandes en cours</h2>
          <p className="tableau-de-bord__valeur">—</p>
        </article>

        <article className="tableau-de-bord__carte">
          <h2>Pièces en fabrication</h2>
          <p className="tableau-de-bord__valeur">—</p>
        </article>

        <article className="tableau-de-bord__carte">
          <h2>Pièces terminées</h2>
          <p className="tableau-de-bord__valeur">—</p>
        </article>

        <article className="tableau-de-bord__carte">
          <h2>Pertes enregistrées</h2>
          <p className="tableau-de-bord__valeur">—</p>
        </article>
      </section>

      <section className="tableau-de-bord__carte">
        <h2>Production par étape</h2>
        <p>La répartition des pièces par étape apparaîtra ici.</p>
      </section>

      <section className="tableau-de-bord__carte">
        <h2>Commandes prêtes à livrer</h2>
        <p>Les commandes terminées apparaîtront ici.</p>
      </section>
    </main>
  );
}
