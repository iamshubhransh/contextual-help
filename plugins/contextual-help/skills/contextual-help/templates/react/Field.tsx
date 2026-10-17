// Field.tsx — label, one-line hint, optional "rare case" disclosure, and an error that says how to fix it.
// Wires aria-describedby (hint + error) and aria-invalid onto the control so screen readers get all of it.
import * as React from 'react';

type Props = {
  label: string;
  /** One line the label can't say: format, example, consequence, who sees it. Omit if it would repeat the label. */
  hint?: React.ReactNode;
  /** What went wrong and how to fix it. Shown next to the field; the control keeps its value. */
  error?: string;
  /** Optional toggletip placed after the label (one per concept, not per field). */
  info?: React.ReactNode;
  /** Help most people skip: a question in the user's words, revealed on demand. */
  details?: { summary: string; content: React.ReactNode };
  children: React.ReactElement; // the input/select/textarea
};

let uid = 0;

export function Field({ label, hint, error, info, details, children }: Props) {
  const id = React.useMemo(() => `field-${++uid}`, []);
  const control = React.Children.only(children);
  const controlId = control.props.id ?? id;
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null, control.props['aria-describedby']]
    .filter(Boolean).join(' ') || undefined;

  if (process.env.NODE_ENV !== 'production' && typeof hint === 'string' && hint.toLowerCase().includes(label.toLowerCase()) && hint.length < label.length + 20) {
    console.warn(`Hint for "${label}" mostly repeats the label — say what the label can't, or drop it.`);
  }

  return (
    <div className="field" data-invalid={error ? '' : undefined}>
      <div className="field-label-row">
        <label htmlFor={controlId} className="field-label">{label}</label>
        {info}
      </div>
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {React.cloneElement(control, {
        id: controlId,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}
      {error && (
        <p id={`${id}-error`} className="field-error">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor" /><path d="M8 4.5v4.2M8 11h.01" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>
          {error}
        </p>
      )}
      {details && (
        <details className="field-details">
          <summary>{details.summary}</summary>
          <div className="field-details-body">{details.content}</div>
        </details>
      )}
    </div>
  );
}

/** Top-of-form error summary for long forms: focus it on submit so it's announced, link each error to its field. */
export const ErrorSummary = React.forwardRef<HTMLDivElement, { errors: { fieldId: string; message: string }[] }>(
  function ErrorSummary({ errors }, ref) {
    if (!errors.length) return null;
    return (
      <div ref={ref} className="error-summary" role="alert" tabIndex={-1}>
        <p className="error-summary-title">Fix {errors.length === 1 ? 'this' : `these ${errors.length}`} to continue:</p>
        <ul>
          {errors.map((e) => (
            <li key={e.fieldId}><a href={`#${e.fieldId}`} onClick={(ev) => { ev.preventDefault(); document.getElementById(e.fieldId)?.focus(); }}>{e.message}</a></li>
          ))}
        </ul>
      </div>
    );
  },
);
