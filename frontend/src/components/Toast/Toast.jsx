import "./Toast.css";

const ICONS = {
  success: <path d="M5 13l4 4L19 7" />,
  error: <path d="M6 6l12 12M18 6L6 18" />,
};

export default function Toast({ type, message }) {
  return (
    <div className={`toast toast--${type}`} role="status">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
           stroke="currentColor" strokeWidth="3" strokeLinecap="round"
           strokeLinejoin="round" aria-hidden="true">
        {ICONS[type]}
      </svg>
      <span>{message}</span>
    </div>
  );
}