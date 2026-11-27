import { useState, useRef, useEffect } from "react";
import "./TicketMenu.css";

function TicketMenu({ actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Ferme le menu au clic extérieur ou sur Échap
  useEffect(() => {
    if (!open) return;

    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="ticket-menu" ref={ref}>
      <button
        type="button"
        className="ticket-menu__trigger"
        aria-label="Actions du ticket"
        aria-haspopup="menu"
        aria-expanded={open}
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        ⋮
      </button>

      {open && (
        <ul className="ticket-menu__list" role="menu">
          {actions.map((a) => (
            <li key={a.label} role="none">
              <button
                type="button"
                role="menuitem"
                className={a.danger ? "is-danger" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  a.onClick();
                }}
              >
                <span aria-hidden="true">{a.icon}</span> {a.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TicketMenu;