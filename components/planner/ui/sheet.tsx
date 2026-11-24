import type { ReactNode } from "react";

export function Sheet({
  children,
  onClose,
  form = false,
  label,
  onSubmit,
}: {
  children: ReactNode;
  onClose: () => void;
  form?: boolean;
  label?: string;
  onSubmit?: () => void;
}) {
  const className = form ? "panel" : "panel";
  return (
    <div id="sheet" className="on">
      <div className="sbg" onClick={onClose} />
      {form ? (
        <form
          className={className}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.();
          }}
        >
          {children}
        </form>
      ) : (
        <div className={className} role="dialog" aria-modal="true">
          {children}
        </div>
      )}
    </div>
  );
}
