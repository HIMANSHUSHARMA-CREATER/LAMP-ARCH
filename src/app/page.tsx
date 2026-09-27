"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";

const stages = [
  {
    id: "learn",
    number: "01",
    title: "LEARN",
    color: "#7090ff",
    eyebrow: "FOUNDATION MODULE",
    description: "Understand the theory and fundamentals of the LAMP architecture.",
    bullets: ["Architecture diagrams for visual understanding", "Clear breakdowns of core concepts", "Interactive examples for every service"],
  },
  {
    id: "practice",
    number: "02",
    title: "PRACTICE",
    color: "#ffc22b",
    eyebrow: "SIMULATION MODULE",
    description: "Gain hands-on experience through guided server simulations.",
    bullets: ["Step-by-step terminal exercises", "Guided missions inside a server environment", "Architecture diagrams for reference"],
  },
  {
    id: "diy",
    number: "03",
    title: "DIY",
    color: "#27e3b0",
    eyebrow: "CHALLENGE MODULE",
    description: "Apply acquired knowledge to solve challenges independently.",
    bullets: ["Task-based challenges to test skills", "Hints and validation when you need them", "Earn XP as you prove your solution"],
  },
];

export default function Home() {
  const [active, setActive] = useState("learn");
  const selected = stages.find((stage) => stage.id === active) ?? stages[0];

  return (
    <main className="solution-shell" style={{ "--accent": selected.color } as React.CSSProperties}>
      <div className="scanlines" aria-hidden="true" />
      <header className="solution-header">
        <div className="brand-lockup">
          <span className="brand-mark">LQ</span>
          <div>
            <p className="micro-label">TRAINING SIMULATION / 01</p>
            <p className="brand-name">LAMP <span>QUEST</span></p>
          </div>
        </div>
        <div className="header-status"><span className="status-dot" /> SYSTEM ONLINE <span className="status-divider" /> SECTOR 07</div>
      </header>

      <section className="hero-copy">
        <p className="micro-label accent-label">MISSION CONTROL // SOLUTION CENTER</p>
        <h1>Solution Center <span>Overview</span></h1>
        <p className="hero-subtitle">Build the stack. Understand the system. Own the architecture.</p>
      </section>

      <section className="progression" aria-label="LAMP Quest progression">
        <div className="progress-line" aria-hidden="true"><span /></div>
        {stages.map((stage) => (
          <button
            key={stage.id}
            type="button"
            className={`stage-node ${active === stage.id ? "is-active" : ""}`}
            style={{ "--stage": stage.color } as React.CSSProperties}
            onClick={() => setActive(stage.id)}
            aria-pressed={active === stage.id}
          >
            <span className="stage-number">{stage.number}</span>
            <span className="stage-title">{stage.title}</span>
            <span className="stage-corner" />
          </button>
        ))}
      </section>

      <section className="detail-grid">
        {stages.map((stage) => (
          <article key={stage.id} className={`detail-panel ${active === stage.id ? "is-selected" : ""}`} style={{ "--stage": stage.color } as React.CSSProperties}>
            <div className="panel-topline"><span>{stage.eyebrow}</span><span>NODE_{stage.number}</span></div>
            <h2>{stage.description}</h2>
            <ul>{stage.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            <span className="panel-notch" />
          </article>
        ))}
      </section>

      <section className="console-dock">
        <div className="dock-screen">
          <div className="screen-grid" aria-hidden="true" />
          <div className="screen-content">
            <p className="micro-label">ACTIVE PATH // {selected.number}</p>
            <strong>{selected.title} MODULE READY</strong>
            <span>{selected.description}</span>
          </div>
          <div className="screen-meter"><span style={{ width: `${Number(selected.number) * 33.33}%`, background: selected.color }} /></div>
        </div>
        <Link href="/play" className="enter-button"><span>ENTER SIMULATION</span><b>→</b></Link>
        <div className="dock-readout"><span>XP</span><strong>000</strong><small>LEVEL 01</small></div>
      </section>

      <footer className="solution-footer"><span>© LAMP QUEST // CLOUD ARCHITECTURE TRAINING</span><span>SELECT MODULE TO BEGIN <i>●</i></span></footer>
    </main>
  );
}

