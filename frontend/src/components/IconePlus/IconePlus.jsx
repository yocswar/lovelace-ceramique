/**
 * Logo PotterPilot (SVG inline).
 * La couleur suit la propriété CSS `color` (fill="currentColor"),
 * ce qui permet de l'adapter au fond : voir .fc-logo dans FormulaireConnexion.css.
 */
function IconePlus({ className = "", ...props }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentcolor" xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M6 12H18M12 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
}

export default IconePlus;