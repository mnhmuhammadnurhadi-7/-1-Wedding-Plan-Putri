"use client";

import { useEffect, useRef } from "react";

interface CountdownSectionProps {
  weddingDate?: string;
  brideName?: string;
  groomName?: string;
}

export function CountdownSection({
  weddingDate,
  brideName = "Sofiya",
  groomName = "Antariksa",
}: CountdownSectionProps) {
  const dRef = useRef<HTMLSpanElement>(null);
  const hRef = useRef<HTMLSpanElement>(null);
  const mRef = useRef<HTMLSpanElement>(null);
  const sRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!weddingDate) return;
    const target = new Date(`${weddingDate}T00:00:00`).getTime();

    function tick() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        if (dRef.current) dRef.current.textContent = "0";
        if (hRef.current) hRef.current.textContent = "0";
        if (mRef.current) mRef.current.textContent = "0";
        if (sRef.current) sRef.current.textContent = "0";
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const mi = Math.floor((diff % 3600000) / 60000);
      const sc = Math.floor((diff % 60000) / 1000);
      if (dRef.current) dRef.current.textContent = String(d);
      if (hRef.current) hRef.current.textContent = String(h);
      if (mRef.current) mRef.current.textContent = String(mi);
      if (sRef.current) sRef.current.textContent = String(sc);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [weddingDate]);

  return (
    <section className="bn-top" aria-label="Sapaan dan hitung mundur">
      <div className="bn-hi">
        <h1>
          Halo,
          <br className="bn-br" /> {groomName} &amp; {brideName} <span className="bn-hrt">♡</span>
        </h1>
        <p>Ini ringkasan persiapan pernikahan kalian hari ini.</p>
      </div>
      <div className="bn-cd">
        <div className="bn-cdl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h2>Menuju Hari Bahagia</h2>
        </div>
        <div className="bn-cdg">
          <div>
            <b id="cd-d" ref={dRef}>–</b>
            <span>Hari</span>
          </div>
          <div>
            <b id="cd-h" ref={hRef}>–</b>
            <span>Jam</span>
          </div>
          <div>
            <b id="cd-m" ref={mRef}>–</b>
            <span>Menit</span>
          </div>
          <div>
            <b id="cd-s" ref={sRef}>–</b>
            <span>Detik</span>
          </div>
        </div>
        <div className="bn-cdd">
          {weddingDate ? (
            new Date(`${weddingDate}T00:00:00`).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          ) : (
            "Atur tanggal pernikahan di Pengaturan"
          )}
        </div>
        <div className="bn-couple" aria-hidden="true"></div>
      </div>
    </section>
  );
}
