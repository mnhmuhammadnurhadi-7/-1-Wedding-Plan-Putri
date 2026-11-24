import type { ReactNode } from "react";

export function EmptyBox({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card empty">
      <b>{title}</b>
      {children}
      {action}
    </div>
  );
}
