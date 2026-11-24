"use client";

interface RundownSessionTabsProps {
  activeSession: "Akad Nikah" | "Resepsi";
  onSessionChange: (session: "Akad Nikah" | "Resepsi") => void;
}

export function RundownSessionTabs({
  activeSession,
  onSessionChange,
}: RundownSessionTabsProps) {
  return (
    <div className="seg" style={{ marginBottom: "16px" }}>
      {(["Akad Nikah", "Resepsi"] as const).map((k) => (
        <button
          key={k}
          type="button"
          aria-pressed={activeSession === k}
          onClick={() => onSessionChange(k)}
        >
          {k}
        </button>
      ))}
    </div>
  );
}
