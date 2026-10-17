# contextual-help

A Claude skill for **contextual help**: tooltips that earn their place, inline hints, empty
states that teach, onboarding that doesn't nag, and error messages with a way out.

Agents fail at help in two opposite ways. Some add none at all, even on a form full of jargon
and irreversible actions. Others write a paragraph under every field and put an ⓘ on every
word. This skill decides where help belongs, what form it takes, and how few words it can use.

## What it does

1. **Fixes the UI before explaining it.** A tooltip that explains a confusing label is a bug
   report about the label. It works through better labels, structure, defaults and
   constraints before adding any help.
2. **Decides if help is needed.** It weighs five signals: confusion, cost of a mistake, how
   often the thing is used, who uses it, and evidence such as tickets and errors. A good
   label is often enough. Anything irreversible always states its consequence first.
3. **Picks the lightest form.** In order:
   - A one-line hint (never a placeholder).
   - A toggletip for the few who need detail.
   - A collapsed question for the rare case.
   - A teaching empty state.
   - A just-in-time tip triggered by the moment it becomes relevant.
   - A checklist for real setup.
   - Tours only when opt-in.
4. **Uses tooltips for three jobs only.** These are naming icon buttons, showing truncated
   text, and revealing a keyboard shortcut. Each is wired so a screen reader hears the text
   exactly once. A tooltip has a delay the first time, then opens instantly for its
   neighbours. Only one is open at a time, Esc closes it, and you can move the pointer onto
   it. Tooltips never appear on touch and never come from a `title` attribute.
5. **Reviews an existing app read-only.** Findings come at `file:line`, ranked P0–P2. A
   required list covers help to *remove*. Each plan has exact copy and can be executed
   without context.

## Details it gets right

Each of these was checked in a real browser or against a primary source:

- **Disabled buttons:** they still get hover events in modern browsers, but keyboard users
  can't focus them, so a tooltip on one is invisible to them. The skill uses `aria-disabled`
  and a visible reason instead.
- **CSS `:hover`:** on iOS Safari a tap leaves a `:hover`-only bubble stuck open.
- **Toggletips:** they're wired as a live region, because `aria-describedby` reads them
  before anyone asks.
- **Phone screens:** a bubble hanging off a 390px screen widens the page, so the browser zooms
  out and every tap target moves. Shifting it with a CSS transform doesn't fix that.
- **Unsupported or unsourced claims it avoids:**
  - `popover="hint"` and `interestfor` aren't widely supported yet, so it doesn't rely on them.
  - Only Apple gives a tooltip length limit (60–75 characters), so it doesn't claim a
    universal "80 character" rule.

## What's in the box

| | |
| --- | --- |
| `SKILL.md` | the decision check, the escalation list, rules for each kind of help, writing rules and length limits, common mistakes, accessibility, review mode, ship checklist |
| `REVIEW.md` | where to look, how to judge existing help, priorities, report format, plan template |
| `RECIPES.md` | how to use the templates; adapting Radix, Base UI, MUI, Floating UI and native `popover`; plain-HTML versions; copy formulas; sources |
| `templates/react/` | `Tooltip`, `Toggletip`, `Field` (+ `ErrorSummary`), `EmptyState`, `onboarding` (just-in-time tips, checklist, docs links, dismissal memory), `help.css`, `Example` — dependency-free, exercised by 19 Playwright checks in Chromium and WebKit |

## Install

### npx skills

```bash
npx skills add iamshubhransh/contextual-help
```

### One-line install

```bash
curl -fsSL https://raw.githubusercontent.com/iamshubhransh/contextual-help/main/install.sh | bash
```

> Like to read before you pipe to `bash`? [Review `install.sh`](./install.sh) first, or clone
> the repo and run `./install.sh` locally.

### Claude Code plugin

```text
/plugin marketplace add iamshubhransh/contextual-help
/plugin install contextual-help@contextual-help
```

### claude.ai

Download `contextual-help.zip` from the [latest release](https://github.com/iamshubhransh/contextual-help/releases/latest),
then go to **Customize → Skills → Upload a skill**.

## Use it

It loads on its own for tooltips, help text, empty states, onboarding, confusing terms and
vague errors. It also loads when you're building a form, signup, settings page or setup flow,
even if help never comes up:

- *"Add tooltips to the icon buttons in the toolbar."*
- *"New customers don't understand what 'proration' means on the billing page."*
- *"Our checkout errors just say 'invalid' and wipe the field."*
- *"Build the company signup form for our payroll app."*
- *"Audit the help text in our settings — we think there's too much of it."*

Or call it with `/contextual-help`.

## How it was tested

Three tasks were each run with and without the skill and graded against the code:

| Task | With skill | Without |
| --- | --- | --- |
| Build a webhook settings page (help never mentioned) | 10/10 | 7/10 |
| Declutter an over-helped team page | 12/12 | 11/12 |
| Review a developer console (graders judged the skill's report more actionable) | 11/11 | 11/11 |

In trigger tests it fired for all 10 help-related requests and none of 8 near-misses, such as
landing copy, visual polish and table density. A fact-check against WCAG 2.2, WAI-ARIA, MDN,
Nielsen Norman Group, GOV.UK, Apple's HIG, Microsoft's guidelines and the Radix, Base UI and
MUI sources corrected four claims before release.

Inspired by [Emil Kowalski's skills](https://github.com/emilkowalski/skills) and Heydon
Pickering's [Inclusive Components](https://inclusive-components.design/tooltips-toggletips/).

## License

MIT — see [LICENSE](./LICENSE).
