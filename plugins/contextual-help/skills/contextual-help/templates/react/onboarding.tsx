// onboarding.tsx — push help that behaves: dismissible, remembered, versioned, one at a time.
import * as React from 'react';

const PREFIX = 'help:dismissed:';

function read(key: string): boolean {
  try { return localStorage.getItem(PREFIX + key) === '1'; } catch { return false; }
}
function write(key: string, value: boolean) {
  try { value ? localStorage.setItem(PREFIX + key, '1') : localStorage.removeItem(PREFIX + key); } catch {}
}

/**
 * Remember a dismissal per user and device. Bump `version` when the help changes meaningfully,
 * so it shows once more. (For signed-in products, also store this server-side.)
 */
export function useDismissed(id: string, version = 1): [boolean, () => void] {
  const key = `${id}@${version}`;
  const [dismissed, setDismissed] = React.useState(() => read(key));
  const dismiss = React.useCallback(() => { write(key, true); setDismissed(true); }, [key]);
  return [dismissed, dismiss];
}

/** "Show tips again" in the help menu. */
export function resetHelp() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
  } catch {}
}

// Only one push tip on screen at a time, across the app.
let activeTip: string | null = null;
const listeners = new Set<() => void>();
const claim = (id: string) => { if (activeTip && activeTip !== id) return false; activeTip = id; return true; };
const release = (id: string) => { if (activeTip === id) { activeTip = null; listeners.forEach((l) => l()); } };

type TipProps = {
  id: string;
  version?: number;
  /** True at the moment the feature becomes relevant (first multi-select, first empty report…). Never "on load". */
  when: boolean;
  children: React.ReactNode;          // one sentence
  action?: { label: string; onClick: () => void };
};

/** A just-in-time tip: non-modal, never steals focus, dismissible with a button or Esc (when focus is inside). */
export function JustInTimeTip({ id, version = 1, when, children, action }: TipProps) {
  const [dismissed, dismiss] = useDismissed(id, version);
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => { listeners.add(force); return () => { listeners.delete(force); }; }, []);
  const visible = when && !dismissed && claim(id);
  React.useEffect(() => { if (!visible) release(id); return () => release(id); }, [visible, id]);
  if (!visible) return null;
  const close = () => { dismiss(); release(id); };
  return (
    <div
      className="jit-tip"
      role="status"                     // announced politely; doesn't move focus
      onKeyDown={(e) => { if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); close(); } }}
    >
      <p className="jit-tip-text">{children}</p>
      <div className="jit-tip-actions">
        {action && <button className="btn btn-small" onClick={() => { action.onClick(); close(); }}>{action.label}</button>}
        <button className="btn btn-small btn-link" onClick={close}>Got it</button>
      </div>
    </div>
  );
}

type Item = { id: string; label: string; done: boolean; go: () => void };

/** A setup checklist: items complete themselves from real state (pass `done` from your data), never from a click here. */
export function Checklist({ id, title, items }: { id: string; title: string; items: Item[] }) {
  const [hidden, hide] = useDismissed(`checklist:${id}`);
  const doneCount = items.filter((i) => i.done).length;
  if (hidden || doneCount === items.length) return null;   // retire it when setup is done
  return (
    <section className="checklist" aria-labelledby={`${id}-title`}>
      <div className="checklist-head">
        <h2 id={`${id}-title`} className="checklist-title">{title}</h2>
        <span className="checklist-progress">{doneCount} of {items.length} done</span>
        <button className="btn btn-small btn-link" onClick={hide}>Hide</button>
      </div>
      <ol className="checklist-items">
        {items.map((i) => (
          <li key={i.id} data-done={i.done ? '' : undefined}>
            <span className="checklist-check" aria-hidden="true">{i.done ? '✓' : ''}</span>
            {i.done ? (
              <span className="checklist-label"><span className="sr-only">Done: </span>{i.label}</span>
            ) : (
              <button className="checklist-label btn-link" onClick={i.go}>{i.label}</button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

// Docs links in one place: a docs move is one edit, and a test can check every URL.
export const DOCS = {
  proration: 'https://docs.example.com/billing#proration',
  projects: 'https://docs.example.com/projects#projects-and-teams',
  webhookSigning: 'https://docs.example.com/webhooks#verify-signatures',
} as const;

/** A link that says what you'll learn, goes to the exact section, and doesn't lose the user's work. */
export function DocsLink({ to, children }: { to: keyof typeof DOCS; children: string }) {
  return (
    <a className="docs-link" href={DOCS[to]} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
