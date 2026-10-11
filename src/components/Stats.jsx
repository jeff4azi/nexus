import { useState, useEffect, useRef } from "react";
import { useReveal } from "../hooks/useReveal";

const stats = [
  { end: 2.4, prefix: "$", suffix: "B", label: "Assets Under Management" },
  { end: 98, prefix: "", suffix: "%", label: "Client Retention Rate" },
  { end: 15, prefix: "", suffix: "+", label: "Years of Excellence" },
  { end: 340, prefix: "", suffix: "+", label: "Global Clients Served" },
];

function useCountUp(end, duration = 2000, active = false) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const isDecimal = end % 1 !== 0;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;
      setCount(
        isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current),
      );
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(end);
    };
    requestAnimationFrame(tick);
  }, [active, end, duration]);

  return count;
}

function StatItem({ stat, active }) {
  const count = useCountUp(stat.end, 2200, active);

  return (
    <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
      <div
        className="font-display"
        style={{
          fontSize: "clamp(3rem, 6vw, 4.5rem)",
          fontWeight: 700,
          background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1,
          marginBottom: "0.75rem",
        }}
      >
        {stat.prefix}
        {count}
        {stat.suffix}
      </div>
      <div
        style={{
          fontSize: "0.8rem",
          color: "#D6DEE8",
          opacity: 0.6,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {stat.label}
      </div>
    </div>
  );
}

export default function Stats() {
  const { ref, visible } = useReveal();

  return (
    <section
      ref={ref}
      style={{
        padding: "100px 2rem",
        background: "#0F1422",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          className={`reveal ${visible ? "visible" : ""}`}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <p
            style={{
              color: "#C9A84C",
              fontSize: "0.75rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            By The Numbers
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Performance That Speaks
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                borderRight:
                  i < stats.length - 1
                    ? "1px solid rgba(201,168,76,0.12)"
                    : "none",
              }}
            >
              <StatItem stat={stat} active={visible} />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
        }}
      />
    </section>
  );
}
