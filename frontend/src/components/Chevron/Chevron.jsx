import "./Chevron.css";

// Plié → ">" (pointe à droite) ; déplié → "v" (pointe vers le bas).
function Chevron({ plie = false }) {
  return (
    <svg
      className={`chevron ${plie ? "chevron--plie" : "chevron--deplie"}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Dessiné comme ">" : points="9 18 15 12 9 6" */}
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default Chevron;