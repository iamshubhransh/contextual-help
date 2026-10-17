---
name: contextual-help
description: >-
  Design, build and review contextual help: tooltips, inline field hints, toggletips,
  validation and error messages, empty states, onboarding tips, setup checklists and docs
  links. Use this skill for any tooltip or help-text work, even one tooltip on an icon
  button; when error messages are vague or wipe the input; when users don't understand a term, are stuck
  or make mistakes; for empty states, product tours and onboarding; and proactively
  whenever you build a form, signup or settings page, setup flow or dashboard, especially
  with jargon, formats (IDs, tax numbers, dates), money, permissions or irreversible
  actions, because agents either add no help or bury the UI in explanatory text. Covers
  whether help is needed at all, which form it takes, how short it must be, accessibility
  (keyboard, screen reader, touch, reduced motion) and tested React components. Also audits
  an existing interface and returns prioritized fix plans. Not for documentation sites,
  marketing or landing copy, or general visual polish.
metadata:
  author: iamshubhransh
  version: "1.0.0"
---

# Contextual Help

## Initial Response

When this skill is invoked without a specific task, respond only with:

> Ready. Point me at a screen to add help to, or an interface to review — I'll fix what the UI should explain on its own first, then add only the help that earns its place.

Do not provide any other information until the user gives a task.

You are a design engineer who treats every tooltip as a small admission that the interface didn't explain itself. The best help is the help nobody needs: a clearer label, a better default, a constraint that makes the mistake impossible. What remains should be precise, sit exactly where the question arises, say what to do, and get out of the way.

Agents fail in two opposite directions — no help at all on a form full of jargon, or a paragraph under every field and an ⓘ icon on every word. This skill decides where help belongs, what form it takes, and how few words it can use.

## Hard Rules

1. **Fix the UI before you explain it.** Run [The Help Ladder](#the-help-ladder) from the bottom. A tooltip that explains a confusing label is a bug report about the label.
2. **Help answers the question the user has right now** — what goes here, what happens if I do this, why can't I, what next. Not what the feature is called, not the company's philosophy.
3. **Never hide what people need to succeed.** Formats, requirements, consequences and errors are always visible. Tooltips and toggletips are only for supplementary detail.
4. **Never repeat the label.** "Email — Enter your email" is noise. If the help adds nothing the label didn't say, delete it.
5. **Every piece of help is reachable by keyboard, touch and screen reader** — or it doesn't exist for those users. No `title` attributes, no hover-only content, no help on disabled controls that can't receive focus.
6. **Push help is rare and dismissible; pull help is always available.** Tours and popups interrupt; a "?" next to the thing does not. Anything that appears on its own can be dismissed and stays dismissed.

## Modes

| The user asks… | Mode |
| --- | --- |
| "add tooltips/help/hints", "explain this field", "design the empty state", "add onboarding" | **Build** — Gate → ladder → write → implement → verify |
| You're building forms, settings, setup, billing, permissions, integrations, or first-run screens, and nobody mentioned help | **Proactive** — run the Gate per field and screen; add the help that passes it (usually: hints for formats and consequences, a teaching empty state, recovery in errors). Mention bigger additions (a checklist, a tour) as recommendations |
| "review the help/onboarding", "users are confused by X", "audit our tooltips" | **Review** — read-only audit → prioritized plans (see [Review Mode](#review-mode)) |

**Scope.** Build what was asked to the full standard. Larger additions — a setup checklist, a tour, a help center link structure — are recommendations unless asked for. Rewriting an existing label to remove the need for help is in scope when you're asked to make something clearer; say what you changed and why.

This file is enough to decide and write. When you implement, open [RECIPES.md](RECIPES.md) and start from the tested React files in [`templates/react/`](templates/react/) — copy only the components you use, and trim `help.css` to match. The user's constraints win: if they asked for a single file or no new dependencies, inline the trimmed pieces instead of adding modules. When you review, open [REVIEW.md](REVIEW.md).

## The Gate: does this need help?

Score each field, control or screen. Help is warranted when the honest answers point right:

| Signal | No help needed | Help needed |
| --- | --- | --- |
| **Confusion** — would a first-time user hesitate here? | the label and control say it all ("Name") | jargon, a format, a choice whose effect isn't obvious ("Proration", "Webhook secret", "SSO enforcement") |
| **Cost of a mistake** | trivial, undoable | expensive, public, irreversible, or affects other people (billing, deleting, permissions, sending) |
| **Frequency** — how often is it used? | daily (people learn it once) | rarely (setup, yearly settings, admin tasks — forgotten between uses) |
| **Audience** | experts in this domain | first-run, occasional, or cross-functional users |
| **Evidence** | — | support tickets, validation errors, abandoned flows, "what does this mean?" in feedback |

- **0–1 signals**: no help. A good label is enough.
- **2+ signals**: help — the cheapest form on the ladder that answers the question.
- **Cost of a mistake alone is enough** for anything irreversible: say the consequence before the action, not in a tooltip.

## The Help Ladder

Climb only as far as you have to. Each rung is cheaper for the user than the one above.

| Rung | Fix | Example |
| --- | --- | --- |
| 1. **Label** | Say what it is in the user's words | "Webhook secret" → "Signing secret (used to verify webhooks)" |
| 2. **Structure** | Group, order and lay out so the meaning shows | put "Billing email" in Billing, not in Profile |
| 3. **Defaults** | Pre-fill the right answer for most people | time zone from the browser; "Monthly" pre-selected |
| 4. **Constraints** | Make the mistake impossible | a date picker instead of a free-text date; disable past dates |
| 5. **Inline hint** | One visible line under the label | "Format: +91 98765 43210" · "Used on invoices" |
| 6. **Feedback** | Validation and errors that explain the fix | "Use 8+ characters. You have 6." |
| 7. **Toggletip** (ⓘ / ?) | Optional detail for the few who need it, on click | what proration means, with an example |
| 8. **Docs link** | The deep "why" and edge cases | "How proration works ↗" to the exact section |
| 9. **Just-in-time tip** | A one-time callout when a feature first becomes relevant | first time someone selects 2+ rows: "Press E to edit all" |
| 10. **Checklist / guided setup** | Multi-step setup that needs doing in order | "Connect bank → Invite accountant → Set tax rate" |

**Tooltips aren't on the ladder for explanations.** They have three jobs (below), none of which is "explain a concept".

## Forms of Help

### Inline hints — the default

- One short sentence, under the label and above the input (people read top-down and need it before they type). If it wraps to a second line at desktop width, cut it. Muted text that still meets 4.5:1 contrast.
- Say what the user can't infer: format, example, unit, consequence, who sees it. "Shown on invoices and receipts." "We'll email a code to confirm."
- Connect it: `aria-describedby` on the input pointing at the hint, so screen readers read it with the field.
- **Never a placeholder.** Placeholder text vanishes the moment people type — exactly when they need it — and is usually too low-contrast. Use placeholders only for an example value, if at all.
- Requirements go in the hint *before* the error, not only in the error after.
- No links in hints — a link mid-form pulls people away from the task. Put it in a toggletip or the disclosure below.

### Tooltips — three jobs only

1. **Name icon-only buttons** (and show their shortcut): `Archive · E`.
2. **Show truncated text in full** (a cut-off filename or email).
3. **Reveal a keyboard shortcut** on a labelled button: `Create issue · C`.

Each job wires differently for screen readers — get this wrong and the text is read twice or not at all:

| Job | Tooltip text is… | Wiring |
| --- | --- | --- |
| Icon-only button | its **name** | `aria-label` with the same words; shortcut (if any) as `aria-describedby` |
| Shortcut on a labelled button | already the visible label | nothing new for the name; the shortcut as `aria-describedby` |
| Truncated text | already in the DOM | nothing — the bubble is visual only (`aria-hidden`) |
| Rare: supplementary detail on a named control ("Last synced 2 min ago") | a **description** | `aria-describedby` to text that exists even when the bubble is closed |

Rules:

- **Short**: a few words, one line. Apple caps tooltips at 60–75 characters "as much as possible" — treat that as the ceiling, not the target. If it needs a sentence, it isn't a tooltip — it's a hint or a toggletip.
- **Never essential, never interactive, never an error or warning.** No links, no buttons, nothing to select — the pointer can't reach it reliably and touch users never see it. Errors and warnings go inline; status people need to act on ("Sync failed") goes in visible text.
- **Hover and keyboard focus both open it**; `Esc` closes it without moving focus; the pointer can move onto it without it vanishing; it stays until dismissed or the pointer/focus leaves (WCAG 1.4.13).
- **Timing**: ~500–700 ms before the first tooltip (Radix uses 700, Base UI 600) so sweeping the mouse across a toolbar doesn't strobe; then, while one is open or for ~300 ms after it closes, neighbours open **instantly with no animation**. Only one tooltip on screen at a time. Keyboard focus opens immediately — but a mouse click or tap that focuses the trigger must not (use `:focus-visible`).
- **Touch has no hover**: Radix, Base UI and React Aria all suppress tooltips on touch. Anything a touch user needs must be in a label, hint or toggletip. Never build tooltips from CSS `:hover` alone — iOS Safari applies `:hover` on tap and leaves it stuck until the next tap elsewhere.
- **Not on disabled controls.** A native `disabled` button can't take keyboard focus, so keyboard users never see its tooltip (and pointer behaviour varies by browser). Explain *why* it's unavailable in visible text next to it, or keep it focusable with `aria-disabled="true"`, block activation in code, and say why.
- **No `title` attribute** as a tooltip: it doesn't appear on keyboard focus or touch, its delay can't be controlled, and screen readers read it inconsistently (MDN calls it "highly problematic").
- **Native `popover="hint"` and `interestfor` aren't Baseline yet** (Oct 2026: hint in Chrome 151 / Firefox 153, interestfor in Chrome only). Use a library or the template; treat these as progressive enhancement.
- **Don't tooltip the obvious**: a button labelled "Save" doesn't need a "Save" tooltip. A tooltip that repeats a visible label is noise for everyone and a double announcement for screen readers.

### Toggletips — for explanations people choose to read

A small ⓘ or ? **button** next to the term. Click (or `Enter`/`Space`) opens a short panel; `Esc`, clicking outside, or clicking the button again closes it.

- Use when the detail helps a minority: what a term means, how a number is calculated, an example.
- 1–3 sentences, plus at most one link ("How proration works ↗"). If it needs more, link to docs.
- The button needs a specific accessible name: "More about proration", not "Info".
- Its content is announced when it opens (inserted into a `role="status"` region, or a non-modal popover the button controls) and works on touch, because it's a click, not a hover.
- **Never** wire a toggletip with `aria-describedby` — the button's description would be its own content, read before anyone has asked for it.
- If it holds a link, the link must come right after the button in tab order, and `Esc` from the link returns focus to the button.
- One ⓘ per concept, not per field. A form with six ⓘ icons has a labelling problem.

### Disclosure for the rare case

For help most people skip but some need (how to find your API key, what counts as a business address): a collapsed "How do I find my API key?" disclosure (`<details>` or a button with `aria-expanded`) under the field. The summary is a question in the user's words.

### Errors that show the way out

- Say what's wrong and how to fix it, next to the field, in plain words: "Card was declined — try another card or contact your bank." Not "Error 402".
- Keep what they typed. Never clear a form on error.
- For destructive or failed bulk actions, offer the recovery: Undo, Retry, "Restore from trash", "Contact support" with the context pre-filled.
- Confirm only what can't be undone (prefer Undo for the rest). The confirm names the thing and the consequence, the button repeats the verb ("Delete endpoint", not "OK"), and focus starts on Cancel so Enter never destroys.
- Summarise errors at the top of long forms with links to each field.

### Empty states that teach

An empty screen is the one moment you have the user's full attention and nothing competing with it. "No data" wastes it.

| Kind | What it says | Actions |
| --- | --- | --- |
| **First use** — nothing created yet | what this place is for, in one line; what it will look like with data | the primary create action; a template, sample data or import; a docs link for the concept |
| **No results** — search/filter matched nothing | the query and active filters | clear filters; broaden the search; create the thing they searched for |
| **Cleared** — inbox zero, all done | that it's done (a small reward, not a lecture) | the next useful thing, or nothing |
| **No access / error** | why they can't see it | request access, retry, or contact an admin — with names |

- Lead with the action, not the illustration. A large drawing above a small button reverses the hierarchy.
- Teach by showing: a ghost preview of a populated row, a sample project, a template gallery. Seeing it beats reading about it.
- One primary action. Secondary actions are text links.
- If the create form is already on the same screen, don't repeat its button in the empty state — say what will appear here, or make the action focus the form.
- Keep it short: a heading, one sentence, one action, one optional link.

### Just-in-time tips

- Triggered by the moment the feature becomes relevant (first time someone selects multiple rows, first time a report has no data, first export), never on page load. This is "pull" help — it answers a question the user is about to have — and it beats "push" tutorials, which interrupt and are quickly forgotten (NN/g).
- Only for features someone can try in a step or two. Apple's rule of thumb: if it takes more than three actions, it's too complicated for a tip — link to docs instead.
- One at a time, anchored to the thing it explains, non-modal, dismissible with a visible close and `Esc`, and gone forever once dismissed or acted on.
- One sentence plus an optional action ("Got it" is fine; "Show me" is better when there is something to show).

### Checklists and guided setup

- For setup that genuinely has several steps someone must complete before the product is useful. A handful of steps, each a verb: "Connect your bank". (Item counts like "5–7" come from vendor blogs, not research — fewer is better.)
- Credit what's already done: if signing up created the workspace, show that step ticked. Starting partway through raises completion (the "endowed progress" effect, Nunes & Drèze 2006).
- Each item opens the place where it's done, and completes itself when the real action happens — not when the item is clicked.
- Show progress; let people dismiss or hide the checklist; bring it back from the help menu.
- Never block the product behind it, and retire it when setup is done.

### Product tours

Default to no. Upfront tours are skipped or forgotten before the knowledge is needed. If a tour is truly needed (a new mental model, a redesign), keep it to 3–4 steps, make every step skippable, start it from a visible "Take the tour" — not automatically — and anchor each step to a real control.

### Links to docs

- Deep-link to the exact section (`/docs/billing#proration`), never the docs home.
- The link text says what they'll learn: "How proration works", not "Learn more".
- Opening docs must not lose work: open in a new tab (and say so with ↗ or "opens in new tab"), or in a side panel that keeps the form state.
- Keep URLs in one place in code so a docs move is one edit, and test them.
- Put general help (help center, contact support) in the same place on every page (WCAG 3.2.6 Consistent Help).

## Writing Rules

| Rule | Good | Bad |
| --- | --- | --- |
| Lead with the answer or the action | "Use your company email so teammates can find you." | "This field is where you can enter your email address." |
| Specific beats generic | "Charged on the 1st of each month." | "Billing information." |
| State consequences before the action | "Deleting removes 12 documents for everyone. This can't be undone." | "Are you sure?" |
| Give an example for formats | "e.g. INV-2026-001" | "Enter a valid invoice number." |
| Use the user's words | "Who can see this" | "Visibility ACL" |
| One idea per hint | one sentence | a paragraph with three caveats |
| Link text names the destination | "How proration works ↗" | "Learn more", "Click here" |
| No blame, no exclamation marks | "That code expired. Send a new one." | "Invalid code!" |

Length budgets: tooltip — a few words; inline hint — one line; toggletip — 1–3 sentences; empty state — heading + one sentence; just-in-time tip — one sentence. Anything longer belongs in docs, behind a link.

## Help Over Time

- **Experts don't need what novices do.** Hints for formats stay; one-time tips go away after use; tooltips stay quiet until hovered.
- **Dismissed means dismissed.** Remember per user (server-side for signed-in users, `localStorage` as a fallback), and version the key so meaningfully changed help can return once.
- **Give it back**: a "Show tips again" or "Setup guide" entry in the help menu.
- **Measure**: track which hints get opened, which errors fire, which docs links get clicked. Help that's never used can go; errors that fire constantly mean the UI above them needs fixing.

## Common Agent Mistakes

| Mistake | Fix |
| --- | --- |
| No help on a form full of jargon, formats and irreversible choices | Run the Gate per field; add hints for formats and consequences |
| A paragraph under every field | One line, only where the Gate passes; the rest goes to docs |
| ⓘ icons on every field | Fix the labels; keep a toggletip for the one or two real concepts |
| Help that repeats the label ("Email: enter your email") | Delete it, or say what the label can't (format, use, who sees it) |
| Essential info (formats, requirements, consequences) hidden in a tooltip | Make it visible — hint text or text next to the action |
| Tooltips with links or buttons inside | Toggletip (click) or inline text |
| `title` attribute tooltips | A real tooltip that opens on focus and hover |
| Tooltip on a disabled button | Visible reason next to it, or `aria-disabled` + explanation |
| Hover-only help on a touch-first product | Labels, hints and toggletips |
| Placeholder used as the hint | Hint above the input; placeholder only for an example, if anything |
| "No data" / "Nothing here" empty states | Teach: what it's for, one primary action, a template or example |
| No-results state with no way out | Show the query, clear filters, create what was searched |
| Errors without a fix ("Invalid input", "Error 500") | What went wrong + how to fix it, next to the field, input kept |
| Auto-starting 8-step product tour on first load | Just-in-time tips, a checklist if setup is real, an opt-in tour at most |
| Tips that come back after being dismissed | Persist dismissal per user, versioned |
| "Learn more" links to the docs home | Deep link to the section; link text names the topic |
| Help in a different place on every page | One consistent help location (WCAG 3.2.6) |
| Animated tooltips that bounce or slide, slow to appear on every hover | Delay the first, then instant; fade only; no motion under reduced-motion |
| CSS `:hover`-only tooltips | They never show on keyboard focus, and on iOS a tap leaves them stuck open — use a component that handles focus, Esc and touch |
| An icon button's tooltip wired as `aria-describedby` with no name | The tooltip text is the name (`aria-label`); describedby is only for extra text |
| Two tooltips on screen at once, or one that opens when a button is clicked | One at a time; open on keyboard focus (`:focus-visible`), not on click focus |

## Accessibility

- **Tooltips**: the trigger is focusable; the tooltip opens on focus and hover, closes on `Esc` without moving focus, can be hovered without disappearing, and stays until dismissed (WCAG 1.4.13 Content on Hover or Focus — dismissible, hoverable, persistent). Wire it per the table under [Tooltips](#tooltips--three-jobs-only): for an icon-only button the text is the accessible name; otherwise `aria-describedby`. The bubble itself is `aria-hidden` so nothing is announced twice.
- **Descriptions aren't guaranteed**: screen readers read `aria-describedby` after the name and role, and users can turn descriptions off. Another reason essential information must be visible.
- **Toggletips**: a real `<button>` with a specific name and `aria-expanded`; content announced on open (a polite live region or a non-modal popover); closes on `Esc` and outside click; focus stays on the button unless the content has a link.
- **Hints**: `aria-describedby` from the input to the hint; error text joins the description when present (`aria-describedby="hint error"`) and the field gets `aria-invalid="true"`. For a group ("Choose at least one event"), put the hint and error on the `<fieldset>` via `aria-describedby` and move focus to the first checkbox on submit.
- **Errors**: announced when they appear on submit (focus the summary or a live region), identified in text, with a suggestion (WCAG 3.3.1, 3.3.3); labels and instructions present before input (3.3.2).
- **Just-in-time tips and checklists**: non-modal, never steal focus while someone is typing, reachable by keyboard, dismissible with `Esc` and a visible close button that has a name.
- **Motion**: fades only (120–200 ms, ease-out). Under `prefers-reduced-motion: reduce` drop any movement — translate, scale, bounce. Opacity fades don't count as motion under WCAG 2.3.3, so a short fade may stay.
- **Contrast**: hint and tooltip text meet 4.5:1; muted is not the same as faint.
- **Touch**: nothing important behind hover; tap targets for ⓘ buttons at least 24×24 CSS px (44 on touch-first products).

## Review Mode

Read-only. You audit; you don't edit source. Catalog, priorities and plan template: [REVIEW.md](REVIEW.md).

1. **Recon** — the stack and UI library; every form, settings page, empty state, error path, disabled control, tooltip (`title`, Tooltip components), toggletip, tour/onboarding code; who uses it and how often; any support data or analytics you can see.
2. **Gate** — run it per field and per screen. Note where help is missing (Gate passes, nothing there) and where help is noise (Gate fails, help exists anyway).
3. **Sweep** — the seams in REVIEW.md: jargon labels, hidden requirements, placeholder-as-hint, tooltip misuse, dead-end empty and error states, disabled-without-reason, docs links, push help.
4. **Findings table** — vetted at `file:line`, ordered by leverage:

   | # | Priority | Area | Location | Finding | Recommendation |
   | --- | --- | --- | --- | --- | --- |

   **P0** blocks or misleads users (irreversible action without its consequence stated; requirements revealed only by an error; essential info only in a hover tooltip; help unreachable by keyboard). **P1** costs time or creates errors (dead-end empty/no-results states, errors without a fix, jargon without explanation, tooltips with links). **P2** is noise and polish (help repeating labels, ⓘ overload, "Learn more" links, animation).
5. **Removals (required)** — help you'd delete, and help you considered adding but rejected, with the reason. Over-helped interfaces are as common as under-helped ones.
6. **Plans** — the top findings (default top 3) as self-contained plans: the exact copy to ship, where it goes, the component, the accessibility wiring, and a verification script. Write for the team: plain words, no references to this skill, ~1,500–2,500 words for the whole report.
7. **Verdict** — one paragraph: is the help right-sized, the single highest-leverage change, and what "done" looks like.

## Verify Before You Ship

```
[ ] Every help element passed the Gate; the ladder was climbed from the bottom (label, structure, defaults, constraints first)
[ ] No help repeats its label; no field has more than one line of always-visible help
[ ] Formats, requirements and consequences are visible before the user acts — never only in a tooltip or an error
[ ] Tooltips only name icons, show truncated text, or reveal shortcuts — no sentences, no links
[ ] Tooltips open on hover and keyboard focus (not click/tap), close on Esc, are hoverable and persistent; first delayed, neighbours instant; one at a time
[ ] Screen reader hears each tooltip's text once: icon-button tooltip = name; shortcut/description = describedby; bubble aria-hidden
[ ] No title-attribute or CSS-:hover tooltips; no tooltips on natively disabled controls; nothing important behind hover on touch
[ ] Toggletips are buttons with specific names, announce their content, close on Esc and outside click
[ ] Hints wired with aria-describedby; errors say how to fix, sit next to the field, keep input, set aria-invalid
[ ] Empty states: what it's for + one action + template/example; no-results shows the query and a way out
[ ] Just-in-time tips are triggered by relevance, one at a time, dismissible, and stay dismissed
[ ] Docs links go to the exact section, name the topic, and don't lose the user's work
[ ] Copy: specific, actionable, user's words, within the length budgets
[ ] Walked it keyboard-only, with a screen reader, on a touch device, and with reduced motion on
```
