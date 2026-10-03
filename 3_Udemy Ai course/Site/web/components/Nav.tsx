"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/data";

const links = [
  ["About", "#about"],
  ["Journey", "#journey"],
  ["Capabilities", "#capabilities"],
  ["Portfolio", "#portfolio"],
  ["Contact", "#contact"],
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${solid ? "solid" : ""}`}>
      <a href="#top" className="brand" aria-label="Back to top">
        <span className="brand-mark">FF</span>
        <span className="brand-name">{profile.name}</span>
      </a>
      <nav aria-label="Primary">
        <ul>
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <a className="nav-cta" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
        Let&rsquo;s talk <span aria-hidden>↗</span>
      </a>
      <span className="progress" style={{ transform: `scaleX(${progress})` }} />
    </header>
  );
}
