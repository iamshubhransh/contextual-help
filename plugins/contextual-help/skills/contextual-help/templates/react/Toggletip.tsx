// Toggletip.tsx — an ⓘ button that reveals a short explanation on click. Works with keyboard, touch and
// screen readers: the content goes into a polite live region when it opens (Inclusive Components pattern),
// Esc and outside clicks close it, and focus stays on the button.
import * as React from 'react';

type Props = {
  /** The concept, used in the button's name: "More about {topic}". */
  topic: string;
  /** 1–3 sentences, plus at most one link. */
  children: React.ReactNode;
  side?: 'right' | 'bottom';
};

let uid = 0;

export function Toggletip({ topic, children, side = 'bottom' }: Props) {
  const id = React.useMemo(() => `toggletip-${++uid}`, []);
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const bubbleRef = React.useRef<HTMLSpanElement>(null);
  const [shift, setShift] = React.useState(0);

  // Keep the bubble inside the viewport. On a phone, a bubble hanging off the right edge widens the page
  // and the browser zooms out — every tap target moves. (Shift with margin, not transform: a transformed
  // box still widens the page by its untransformed position.)
  React.useLayoutEffect(() => {
    if (!open || !bubbleRef.current) { setShift(0); return; }
    const r = bubbleRef.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    let dx = 0;
    if (r.right > vw - 8) dx = vw - 8 - r.right;
    if (r.left + dx < 8) dx = 8 - r.left;
    setShift(dx);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();                       // handled: other Esc handlers should skip it
      setOpen(false);
      if (rootRef.current?.contains(document.activeElement)) buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  return (
    <span className="toggletip" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="toggletip-button"
        aria-label={`More about ${topic}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 7.2v3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="5" r=".9" fill="currentColor" />
        </svg>
      </button>
      {/* The live region is always rendered; filling it on open is what makes screen readers announce it. */}
      <span id={id} role="status" className="toggletip-region">
        {open && (
          <span ref={bubbleRef} className="toggletip-bubble" data-side={side} style={shift ? { marginLeft: shift } : undefined}>
            {children}
          </span>
        )}
      </span>
    </span>
  );
}
