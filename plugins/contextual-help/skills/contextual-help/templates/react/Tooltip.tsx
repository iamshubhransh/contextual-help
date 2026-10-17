// Tooltip.tsx — a tooltip for three jobs only: name an icon button, show truncated text, reveal a shortcut.
// Opens on hover (after a delay) and keyboard focus, never on touch; Esc closes it; the pointer can move
// onto it; neighbours open instantly once one has been open (the "delay group").
import * as React from 'react';
import { createPortal } from 'react-dom';

type Props = {
  /** A few words. Not a sentence, never a link. */
  label: string;
  /** Optional keyboard shortcut shown after the label, e.g. "E" or "⌘K". */
  shortcut?: string;
  /**
   * "label" (default): the tooltip text IS the control's name — icon-only buttons, or a labelled button
   *          that's only showing its shortcut. It becomes aria-label (identical to any visible text), the
   *          shortcut becomes a short description, and the bubble is aria-hidden so nothing is read twice.
   * "description": extra text the control doesn't already say. Linked with aria-describedby and
   *          available even while the bubble is closed.
   * "visual": the text is already in the accessibility tree (e.g. a visually truncated filename whose full
   *          text is in the DOM) — the bubble is for sighted users only and changes nothing for screen readers.
   */
  kind?: 'label' | 'description' | 'visual';
  side?: 'top' | 'bottom';
  children: React.ReactElement;
};

const OPEN_DELAY = 500;    // first tooltip: long enough that sweeping across a toolbar doesn't strobe
const GROUP_WINDOW = 300;  // after one closes, neighbours within this window open instantly
const CLOSE_GRACE = 100;   // time to move the pointer from trigger onto the bubble

let lastClosedAt = 0;      // shared across all tooltips on the page
let openCount = 0;
let closeActive: (() => void) | null = null;   // only one tooltip on screen at a time

const focusVisible = (el: Element) => { try { return el.matches(':focus-visible'); } catch { return true; } };

let uid = 0;
const useId = () => React.useMemo(() => `tt-${++uid}`, []);

export function Tooltip({ label, shortcut, kind = 'label', side = 'top', children }: Props) {
  if (process.env.NODE_ENV !== 'production' && label.length > 60) {
    console.warn(`Tooltip "${label.slice(0, 30)}…" is ${label.length} characters — that's a hint or a toggletip, not a tooltip.`);
  }
  const id = useId();
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const bubbleRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [instant, setInstant] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number; side: 'top' | 'bottom' } | null>(null);
  const openTimer = React.useRef<number>();
  const closeTimer = React.useRef<number>();
  const close = React.useCallback(() => setOpen(false), []);

  const show = (now: boolean) => {
    window.clearTimeout(closeTimer.current);
    if (open) return;
    const inGroup = openCount > 0 || Date.now() - lastClosedAt < GROUP_WINDOW;
    const go = () => {
      if (closeActive && closeActive !== close) closeActive();   // the neighbour's bubble goes now, not after its grace
      closeActive = close;
      setInstant(now || inGroup); setOpen(true);
    };
    if (now || inGroup) go();
    else openTimer.current = window.setTimeout(go, OPEN_DELAY);
  };
  const hide = (grace = 0) => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(close, grace);
  };

  React.useEffect(() => {
    if (!open) return;
    openCount++;
    return () => { openCount--; lastClosedAt = Date.now(); if (closeActive === close) closeActive = null; };
  }, [open]);

  // Position: centred on the trigger, flipped if there's no room, clamped to the viewport.
  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current || !bubbleRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const b = bubbleRef.current.getBoundingClientRect();
    let s = side;
    if (s === 'top' && t.top - b.height - 8 < 0) s = 'bottom';
    if (s === 'bottom' && t.bottom + b.height + 8 > window.innerHeight) s = 'top';
    const top = s === 'top' ? t.top - b.height - 6 : t.bottom + 6;
    const vw = document.documentElement.clientWidth;   // excludes the scrollbar
    const left = Math.min(Math.max(8, t.left + t.width / 2 - b.width / 2), vw - b.width - 8);
    setPos({ top, left, side: s });
  }, [open, side, label]);

  // Esc closes the tooltip and nothing else; focus stays where it is (WCAG 1.4.13 "dismissible").
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); e.stopPropagation(); setOpen(false); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  React.useEffect(() => () => { window.clearTimeout(openTimer.current); window.clearTimeout(closeTimer.current); }, []);

  const child = React.Children.only(children);
  // Description text: the label (+ shortcut) for "description" tooltips; just the shortcut for "label" ones.
  const descText = kind === 'description' ? (shortcut ? `${label}, shortcut ${shortcut}` : label) : kind === 'label' && shortcut ? `Shortcut: ${shortcut}` : null;
  const describedBy = [child.props['aria-describedby'], descText ? `${id}-desc` : null].filter(Boolean).join(' ') || undefined;

  const trigger = React.cloneElement(child, {
    ref: (el: HTMLElement | null) => {
      triggerRef.current = el;
      const r = (child as any).ref;
      if (typeof r === 'function') r(el); else if (r) r.current = el;
    },
    'aria-label': kind === 'label' ? label : child.props['aria-label'],
    'aria-describedby': describedBy,

    onPointerEnter: (e: React.PointerEvent) => { child.props.onPointerEnter?.(e); if (e.pointerType !== 'touch') show(false); },
    onPointerLeave: (e: React.PointerEvent) => { child.props.onPointerLeave?.(e); hide(CLOSE_GRACE); },
    onPointerDown: (e: React.PointerEvent) => { child.props.onPointerDown?.(e); hide(); },
    // Keyboard focus only: a click or tap also focuses the trigger, and on touch that focus arrives after
    // pointerup, so a "pointer is down" flag misses it. :focus-visible is the browser's own keyboard signal.
    onFocus: (e: React.FocusEvent) => { child.props.onFocus?.(e); if (focusVisible(e.currentTarget)) show(true); },
    onBlur: (e: React.FocusEvent) => { child.props.onBlur?.(e); hide(); },
  });

  return (
    <>
      {trigger}
      {descText && (
        // Always in the DOM so the description is read whether or not the bubble is showing
        // (aria-describedby may point at hidden content).
        <span id={`${id}-desc`} hidden>{descText}</span>
      )}
      {open && createPortal(
        <div
          ref={bubbleRef}
          className="tooltip"
          aria-hidden="true"               // the text is already the name or the description
          data-side={pos?.side ?? side}
          data-instant={instant ? '' : undefined}
          style={{ position: 'fixed', top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
          onPointerEnter={() => window.clearTimeout(closeTimer.current)}   // hoverable (WCAG 1.4.13)
          onPointerLeave={() => hide(CLOSE_GRACE)}
        >
          {label}
          {shortcut && <kbd className="tooltip-kbd">{shortcut}</kbd>}
        </div>,
        document.body,
      )}
    </>
  );
}
