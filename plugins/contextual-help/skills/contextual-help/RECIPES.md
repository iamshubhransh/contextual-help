# Recipes

Implementation detail for [SKILL.md](SKILL.md). Decide *whether* and *what* there; come here for *how*.

**Contents:** [Templates](#templates) · [Using a component library](#using-a-component-library) · [Without React](#without-react) · [Copy formulas](#copy-formulas) · [Persistence and measurement](#persistence-and-measurement) · [Testing](#testing) · [Sources](#sources)

## Templates

`templates/react/` is dependency-free React 18+ / TypeScript (strict), tested in Chromium and WebKit against the behaviours in SKILL.md: delay group, focus and touch rules, Esc, hoverable bubbles, computed accessible names and descriptions, live-region announcement, viewport clamping on phones, persisted dismissal. Copy only the files you use and delete the CSS sections for components you didn't copy; restyle `help.css` with your tokens (the `--help-*` custom properties) or translate it to your styling system. If the codebase already has a tooltip, field or empty-state component, extend that instead of adding a second one. If the user asked for a single file, inline the trimmed pieces into it.

| File | What it gives you | Use it for |
| --- | --- | --- |
| `Tooltip.tsx` | `kind="label" \| "description" \| "visual"`, optional `shortcut`; 500 ms first open, instant neighbours, one at a time; keyboard focus only (`:focus-visible`), never touch; Esc; hoverable; bubble `aria-hidden` | icon buttons, shortcuts, truncated text |
| `Toggletip.tsx` | ⓘ button named "More about {topic}", content inserted into a `role="status"` region on click, Esc / outside click close, focus returns to the button, clamped to the viewport | one concept per form that a minority needs explained |
| `Field.tsx` | label + one-line hint + error, wires `aria-describedby` (hint + error) and `aria-invalid`; optional toggletip slot and `<details>` for the rare case; dev warning when a hint repeats its label. `ErrorSummary` for long forms | every form field |
| `EmptyState.tsx` | `first-use`, `no-results`, `done`, `no-access` variants with the right actions for each | every list, table, search and dashboard that can be empty |
| `onboarding.tsx` | `useDismissed(id, version)`, `resetHelp()`, `JustInTimeTip` (one at a time, non-modal, persisted), `Checklist` (completes from real state, hides, retires), `DOCS` registry + `DocsLink` | push help that behaves |
| `help.css` | styles for all of the above; opacity-only animation, none under reduced motion or `data-instant` | — |
| `Example.tsx` | every pattern on one screen | copy-paste starting point |

### Tooltip: which `kind`

```tsx
<Tooltip label="Archive" shortcut="E"><button><ArchiveIcon /></button></Tooltip>          // name = "Archive", description = "Shortcut: E"
<Tooltip label="Create issue" shortcut="C"><button>Create issue</button></Tooltip>       // label matches visible text; adds the shortcut
<Tooltip label={file.name} kind="visual"><span tabIndex={0} className="truncate">{file.name}</span></Tooltip>
<Tooltip label="Last synced 2 minutes ago" kind="description"><button aria-label="Sync now"><SyncIcon /></button></Tooltip>
```

- Default `label` sets `aria-label` to the tooltip text. On a button with visible text, keep the two identical, or voice-control users can't say what they see (WCAG 2.5.3 Label in Name).
- `kind="visual"` only when the full text is already in the DOM (CSS truncation). The trigger must be focusable (`tabIndex={0}`) so keyboard users can reveal it, or use a real link or button.
- Disabled: don't wrap a natively `disabled` button. Use `aria-disabled="true"`, keep it focusable, block the action in the handler, and put the reason in visible text or the description.

### Field: the anatomy

```tsx
<Field
  label="Signing secret"
  hint="Paste it from Stripe → Developers → Webhooks"
  error={errors.secret}                                   // "Paste the secret that starts with whsec_"
  info={<Toggletip topic="signing secrets">We use it to check each webhook really came from Stripe. <DocsLink to="webhookSigning">Verifying webhooks</DocsLink></Toggletip>}
  details={{ summary: "I can't find my secret", content: <>Only account owners can see it. Ask the owner, or <a href="/team">see who that is</a>.</> }}
>
  <input name="secret" autoComplete="off" />
</Field>
```

Most fields need only `label`. Add `hint` when the Gate passes. `info` and `details` are each for perhaps one field per form.

### Empty states

```tsx
<EmptyState kind="first-use" title="Invoices you send appear here"
  body="Create one from scratch, or import from your last tool."
  primary={{ label: 'Create invoice', onClick: create }} secondary={{ label: 'Import CSV', onClick: openImport }}
  preview={<GhostRows count={3} />} docs={<DocsLink to="invoices">How invoicing works</DocsLink>} />

<EmptyState kind="no-results" query={q} filters={activeFilters} onClearFilters={clear} create={{ label: `Create “${q}”`, onClick: () => create(q) }} />
<EmptyState kind="done" title="You're all caught up" next={{ label: 'View archived', onClick: showArchive }} />
<EmptyState kind="no-access" title="Only admins can see billing" body="Ask Priya Shah or another admin to give you access." request={{ label: 'Request access', onClick: request }} />
```

The `no-results` state is a `role="status"`, so a search that empties the list is announced. Don't announce first-use states; they're the page.

### Just-in-time tips and checklists

```tsx
<JustInTimeTip id="bulk-edit" when={selectedCount >= 2} action={{ label: 'Show me', onClick: openBulkEdit }}>
  Press E to edit all selected rows at once.
</JustInTimeTip>

<Checklist id="setup" title="Set up billing" items={[
  { id: 'bank', label: 'Connect your bank', done: !!org.bankAccount, go: () => navigate('/settings/bank') },
  { id: 'tax', label: 'Set your tax rate', done: org.taxRate != null, go: () => navigate('/settings/tax') },
]} />
```

- `when` is a relevance condition from real state, never `true` on mount.
- `done` comes from your data, so finishing the step anywhere ticks it.
- Bump `version` when the tip's content changes meaningfully; it shows once more.
- Add a "Show tips again" item that calls `resetHelp()` to your help menu.

## Using a component library

If the codebase already has a tooltip primitive, use it, tune it, and close the gaps below. Don't add a second tooltip system.

| Library | Defaults to know | Adjust |
| --- | --- | --- |
| **Radix** `@radix-ui/react-tooltip` | `Provider` `delayDuration` 700, `skipDelayDuration` 300 (instant neighbours); content is hoverable; ignores touch; opens on focus except focus from a pointer press | Wrap the app in one `Tooltip.Provider`. Radix links the content as the trigger's `aria-describedby` while it's open and doesn't let you override that, so an icon button labelled "Delete" with tooltip "Delete" may be read "Delete, button, Delete". Accept it, or use the template's `Tooltip` for icon buttons |
| **Base UI** `@base-ui/react` (renamed from `@base-ui-components/react`) | trigger `delay` 600; `Tooltip.Provider` `timeout` 400 for instant neighbours; popup gets `data-instant`; disabled on touch | Style `[data-instant] { transition-duration: 0ms }`. For an ⓘ explanation use `Popover` (Base UI recommends it), not Tooltip |
| **MUI** `@mui/material/Tooltip` | `enterDelay` 100 (short); touch opens on a 700 ms long-press; by default `title` becomes the child's accessible **name**; `describeChild` makes it a description | Raise `enterDelay` to ~500. Use `describeChild` when the child already has a name. MUI's docs wrap disabled buttons in a `<span>`; prefer `aria-disabled` |
| **Floating UI** `@floating-ui/react` | `useHover` `delay` 0; `restMs` waits for the pointer to rest; `safePolygon()` keeps it open while the pointer travels to the bubble | `useHover({ delay: { open: 500 }, handleClose: safePolygon() })` + `useFocus` + `useDismiss` + `useRole({ role: 'tooltip' })`; `FloatingDelayGroup` for instant neighbours |
| **Native** `popover` | `popover="auto"`/`"manual"` is Baseline (newly available); `popover="hint"` and `interestfor` are not Baseline (Oct 2026) | A toggletip can be `<button popovertarget>` + `<div popover>`, with light dismiss and Esc built in. Hover tooltips still need JS |

## Without React

**Hint and error wiring.** This is the part that matters most, and it's plain HTML:

```html
<label for="phone">Phone</label>
<p id="phone-hint" class="field-hint">Include the country code — we text a code here to confirm sign-ins.</p>
<input id="phone" name="phone" inputmode="tel" autocomplete="tel" aria-describedby="phone-hint phone-error" aria-invalid="true">
<p id="phone-error" class="field-error">Enter a phone number with the country code, like +91 98765 43210</p>
```

A missing ID in `aria-describedby` is ignored, so you can list `phone-error` before the error exists.

**Rare-case help.** No JS at all:

```html
<details class="field-details"><summary>Where do I find my API key?</summary><div class="field-details-body">Settings → API → Create key. Only admins see this page.</div></details>
```

**Toggletip.** About 20 lines:

```html
<span class="toggletip">
  <button type="button" class="toggletip-button" aria-label="More about proration" aria-expanded="false" aria-controls="tt-proration">ⓘ</button>
  <span id="tt-proration" role="status" class="toggletip-region"></span>
</span>
<template id="tt-proration-content">Change plans mid-month and you pay only for the days on each plan.</template>
<script>
  for (const btn of document.querySelectorAll('.toggletip-button')) {
    const region = document.getElementById(btn.getAttribute('aria-controls'));
    const tpl = document.getElementById(region.id + '-content');
    const set = (open) => {
      btn.setAttribute('aria-expanded', open);
      region.replaceChildren(open ? Object.assign(document.createElement('span'), { className: 'toggletip-bubble' }) : '');
      if (open) region.firstChild.append(tpl.content.cloneNode(true));   // inserting it is what gets it announced
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('pointerdown', (e) => { if (!btn.parentElement.contains(e.target)) set(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || btn.getAttribute('aria-expanded') !== 'true') return;
      e.preventDefault(); const inside = btn.parentElement.contains(document.activeElement); set(false); if (inside) btn.focus();
    }, true);
  }
</script>
```

**Tooltips without a framework.** Hand-roll one only if you replicate everything `Tooltip.tsx` does (delay group, `:focus-visible`, touch, Esc, hoverable bubble, one at a time, viewport clamp). Otherwise use Floating UI's vanilla `computePosition` with your own event wiring, or skip the tooltip and give the icon button visible text.

## Copy formulas

| Help | Formula | Example |
| --- | --- | --- |
| Hint: format | example in the real format | "Like INV-2026-001" |
| Hint: consequence | what happens with it | "Shown on invoices and receipts" |
| Hint: audience | who sees it | "Only admins can see this" |
| Hint: source | where to find it | "Paste it from Stripe → Developers → Webhooks" |
| Error | what's wrong + how to fix, in the label's words; no "invalid", "please", "oops" | "Enter a date after 1 Jan 2026" · "Use 8 or more characters — you have 6" |
| Destructive confirm | what goes, for whom, reversible or not; the button repeats the verb | "Delete ‘Q3 plan’? Its 12 documents are deleted for everyone. You can't undo this." → **Delete project** |
| Toggletip | definition in plain words + why it matters to them (+ one link) | "Proration: you pay only for the days on each plan when you switch mid-month." |
| Empty, first-use | what this place is for → one action | "Invoices you send appear here" → **Create invoice** |
| Empty, no-results | the query + a way out | "No results for “acme” with Status: Paid" → Clear filters |
| Disabled reason | the condition to unlock it | "Add a payment method to export" |
| Just-in-time tip | when you do X, you can Y | "Press E to edit all selected rows at once." |
| Docs link | the topic, not the action | "How proration works ↗" |

Sentence case. Numerals ("3 projects"). Write for the screen reader too: an icon's name is a verb or noun ("Archive"), not a description of the icon ("Box icon").

## Persistence and measurement

- **Dismissal key**: `help:dismissed:{tipId}@{version}`. For signed-in users store it server-side (with the user's preferences) so it follows them across devices; keep `localStorage` as the fallback, wrapped in try/catch (private mode and blocked storage throw).
- **One push at a time**: the template's claim/release registry; extend it if you have other push surfaces (banners, modals), so a tip never stacks on a modal.
- **Measure** (with your existing analytics, no new vendors): toggletip opens per concept, error frequency per field, docs-link clicks per link, checklist completion per step, tip dismissal vs action rate. A toggletip that most users open means the label should change. An error that fires for many users means the hint or constraint above it is wrong.

## Testing

Assert behaviour, not markup. The harness behind these templates checks each of the following in a real browser (Playwright, Chromium and WebKit):

- **Tooltip timing.** It isn't open at 250 ms and is open by ~650 ms. A neighbour opens instantly with `data-instant` and no animation. Never two at once.
- **Tooltip triggers.** Keyboard focus opens it. Mouse click and touch tap don't. Esc closes it without moving focus and without reaching the page's own Esc handler. The pointer can travel onto the bubble.
- **Accessible names.** These are computed from the accessibility tree (CDP `Accessibility.getPartialAXTree`), not read from attributes:
  - "Archive": name "Archive", description "Shortcut: E".
  - "Delete": name "Delete", no description.
  - A visual tooltip adds nothing.
- **Toggletip.** Its name is "More about …" and `aria-expanded` tracks it. The content lands in `role="status"`. Tab reaches the link inside. Esc from the link returns focus to the button. An outside tap closes it. It never widens the page at 390 px.
- **Field.** The hint is the input's description. On an invalid submit the error joins the description, `aria-invalid` is set, the value is kept, and the summary is focused. Summary links focus their fields.
- **Tips and checklists.** They show only when relevant and persist dismissal across reloads, and `resetHelp()` restores them. A checklist ticks from state and hides persistently.
- **Reduced motion.** It removes the animation.

## Sources

- WCAG 2.2: 1.4.13 Content on Hover or Focus, 2.3.3 Animation from Interactions, 2.5.3 Label in Name, 3.2.6 Consistent Help, 3.3.1–3.3.3. https://www.w3.org/TR/WCAG22/
- WAI-ARIA APG Tooltip pattern (still marked work in progress). https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
- Heydon Pickering, *Inclusive Components*: Tooltips & Toggletips. https://inclusive-components.design/tooltips-toggletips/
- MDN: `title` attribute; `aria-description`; `popover`. https://developer.mozilla.org/
- W3C WAI forms tutorial (instructions, placeholders). https://www.w3.org/WAI/tutorials/forms/instructions/
- Nielsen Norman Group: Tooltip Guidelines; Empty States in Complex Applications; Progressive Disclosure; Onboarding Tutorials vs. Contextual Help; Placeholders in Form Fields Are Harmful. https://www.nngroup.com/
- GOV.UK Design System: text input (hint text), details, error message. https://design-system.service.gov.uk/
- Apple HIG: Offering help (tooltip length, tips). https://developer.apple.com/design/human-interface-guidelines/offering-help
- Microsoft Windows apps: Tooltips. https://learn.microsoft.com/en-us/windows/apps/design/controls/tooltips
- Radix Tooltip, Base UI Tooltip, MUI Tooltip, Floating UI `useHover` docs and source.
- Emil Kowalski, `emil-design-eng` skill (tooltip delay groups, `data-instant`). https://github.com/emilkowalski/skills
- Nunes & Drèze (2006), "The Endowed Progress Effect", *Journal of Consumer Research* 32(4). https://doi.org/10.1086/500480
