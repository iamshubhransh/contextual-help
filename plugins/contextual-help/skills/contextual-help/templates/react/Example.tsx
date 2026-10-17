import * as React from 'react';
import { Tooltip } from './Tooltip';
import { Toggletip } from './Toggletip';
import { Field, ErrorSummary } from './Field';
import { EmptyState } from './EmptyState';
import { JustInTimeTip, Checklist, DocsLink, resetHelp } from './onboarding';

const log = (s: string) => console.log(s);   // stand-in for your real handlers

// Example.tsx — every pattern in one screen. Copy the pieces you need; delete the rest.
export function Example() {
  const [phone, setPhone] = React.useState('');
  const [errors, setErrors] = React.useState<{ fieldId: string; message: string }[]>([]);
  const [selected, setSelected] = React.useState(0);
  const [projects, setProjects] = React.useState(0);
  const [bank, setBank] = React.useState(false);
  const summaryRef = React.useRef<HTMLDivElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = /^\+\d[\d ]{7,}$/.test(phone) ? [] : [{ fieldId: 'phone', message: 'Enter a phone number with the country code, like +91 98765 43210' }];
    setErrors(errs);
    if (errs.length) requestAnimationFrame(() => summaryRef.current?.focus());
  };

  return (
    <main>
      <div className="toolbar">
        <Tooltip label="Archive" shortcut="E" kind="label"><button className="icon-btn">🗄</button></Tooltip>
        <Tooltip label="Delete" kind="label"><button className="icon-btn">🗑</button></Tooltip>
        <Tooltip label="Last synced 2 minutes ago" kind="description"><button className="icon-btn" aria-label="Sync now">⟳</button></Tooltip>
        <Tooltip label="Create issue" shortcut="C" kind="label"><button className="btn">Create issue</button></Tooltip>
        <Tooltip label="quarterly-report-final-v3-approved.pdf" kind="visual"><span className="file" tabIndex={0} style={{ display: 'inline-block', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>quarterly-report-final-v3-approved.pdf</span></Tooltip>
      </div>

      <JustInTimeTip id="bulk-edit" when={selected >= 2} action={{ label: 'Show me', onClick: () => log('show-bulk') }}>
        Press E to edit all selected rows at once.
      </JustInTimeTip>
      <button className="btn" onClick={() => setSelected((s) => s + 1)}>Select a row ({selected})</button>

      <Checklist id="setup" title="Set up billing" items={[
        { id: 'bank', label: 'Connect your bank', done: bank, go: () => setBank(true) },
        { id: 'project', label: 'Create your first project', done: projects > 0, go: () => setProjects(1) },
      ]} />

      <form onSubmit={submit} noValidate>
        <ErrorSummary ref={summaryRef} errors={errors} />
        <Field
          label="Phone"
          hint="Include the country code — we text a code here to confirm sign-ins."
          error={errors[0]?.message}
        >
          <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
        </Field>
        <Field
          label="Billing cycle"
          hint="Charged on the 1st of each month."
          info={
            <Toggletip topic="proration">
              Change plans mid-month and you pay only for the days on each plan. <DocsLink to="proration">How proration works</DocsLink>
            </Toggletip>
          }
          details={{ summary: 'Can I switch to yearly later?', content: 'Yes — any time from Billing. We credit the unused part of your month.' }}
        >
          <select defaultValue="monthly"><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
        </Field>
        <button className="btn btn-primary" type="submit">Save</button>
      </form>

      {projects === 0 ? (
        <EmptyState kind="first-use" title="Projects group your issues by goal" body="Start from a template, or create an empty project and add issues as you go."
          primary={{ label: 'Create project', onClick: () => setProjects(1) }} secondary={{ label: 'Use a template', onClick: () => log('template') }}
          docs={<DocsLink to="projects">How projects and teams fit together</DocsLink>} />
      ) : (
        // Once projects exist, the same list can come back empty from a search or filter:
        <EmptyState kind="no-results" query="quarterly" filters={['Status: Done']} onClearFilters={() => log('clear')} create={{ label: 'Create “quarterly”', onClick: () => log('create-q') }} />
      )}
      <button className="btn btn-link" onClick={() => { resetHelp(); log('reset'); }}>Show tips again</button>
    </main>
  );
}
