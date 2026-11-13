// EcranSucces.jsx : écran de confirmation réutilisable (grand check + message + bouton)
import { useEffect, useRef } from "react";
import "./EcranSucces.css";

/**
 * Props :
 *  - titre         : titre de la confirmation (ex. "Commande créée")
 *  - message       : texte sous le titre (string ou JSX)
 *  - libelleBouton : texte du bouton
 *  - onContinuer   : fonction appelée au clic sur le bouton
 */
export default function EcranSucces({ titre, message, libelleBouton, onContinuer }) {
  const titreRef = useRef(null);

  // Le focus arrive sur le titre : les lecteurs d'écran l'annoncent
  // et la touche Tab mène directement au bouton.
  useEffect(() => {
    titreRef.current?.focus();
  }, []);

  return (
    <section className="ecran-succes">
      <svg
        className="ecran-succes__icone"
        viewBox="0 0 96 96"
        aria-hidden="true"
        focusable="false"
      >
        <circle className="ecran-succes__cercle" cx="48" cy="48" r="44" fill="currentColor" />
        <path
          className="ecran-succes__check"
          d="M28 50 L42 64 L69 34"
          pathLength="1"
          fill="none"
          stroke="#fff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h1 ref={titreRef} tabIndex={-1} className="ecran-succes__titre">
        {titre}
      </h1>

      <button type="button" className="btn btn--plein" onClick={onContinuer}>
        {libelleBouton}
      </button>
    </section>
  );
}
