import { useEffect, useRef } from "react";

/**
 * Spotlight — radial gradient follows mouse cursor inside a container.
 * Mount inside any section to add premium "interactive depth" feel.
 *
 * Listens to mousemove on the parent <section> (or document if no parent).
 * Uses CSS vars + transform — GPU accelerated.
 *
 * Usage:
 *   <section style={{ position: 'relative' }}>
 *     <Spotlight color="rgba(20, 184, 166,0.15)" size={500} />
 *     ...rest of section...
 *   </section>
 */
export default function Spotlight({
  color = "rgba(99,102,241,0.18)",
  size = 600,
  scope = "parent",  // "parent" | "document"
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = scope === "document" ? document.documentElement : el.parentElement;
    if (!target) return;

    let raf = 0;
    const onMove = (e) => {
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
        raf = 0;
      });
    };

    const onLeave = () => {
      el.style.opacity = "0";
    };
    const onEnter = () => {
      el.style.opacity = "1";
    };

    target.addEventListener("mousemove", onMove, { passive: true });
    target.addEventListener("mouseleave", onLeave);
    target.addEventListener("mouseenter", onEnter);
    return () => {
      target.removeEventListener("mousemove", onMove);
      target.removeEventListener("mouseleave", onLeave);
      target.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, [size, scope]);

  return (
    <div ref={ref} aria-hidden="true" style={{
      position: "absolute", top: 0, left: 0,
      width: size, height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
      pointerEvents: "none", zIndex: 1,
      opacity: 0,
      transition: "opacity 0.3s",
      willChange: "transform, opacity",
    }} />
  );
}
