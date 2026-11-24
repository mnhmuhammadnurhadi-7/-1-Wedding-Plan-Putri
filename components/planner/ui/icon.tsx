import { ICON } from "../data/constants";

export function Icon({
  name,
  strokeWidth = 1.6,
  className,
}: {
  name: string;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: ICON[name] || "" }}
    />
  );
}
