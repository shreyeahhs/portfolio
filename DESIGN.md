# Design

Recorded from the built site, not from intention. Source of truth for colour and
type is `src/index.css`; source of truth for every fact on the page is
`src/data/content.ts`.

## Thesis

One person, recorded precisely. It refuses the developer-portfolio card grid and
the job-hunting pitch: this is biography, not candidacy. The register is the one
Shreyas already proved on Prompt Corpus, restrained and reading-first.

The page is about him, not about prompt engineering. That argument is one section
of nine, not the spine, and the opening line is deliberately self-deprecating
rather than a thesis statement.

An earlier direction (a particle-collider event display) was built up and
rejected for reading as gamer-dashboard rather than professional. Near-black with
glowing signal colour is the anti-reference here, not the target.

## Colour

Cool zinc neutrals with a single burnt-orange accent. One accent, used
identically in every section. Light is the default scene, dark is full parity,
and the page never flips theme mid-scroll.

| Token | Light | Dark |
|---|---|---|
| `--c-page` | `#fafafa` | `#0c0c0d` |
| `--c-surface` | `#ffffff` | `#121214` |
| `--c-raised` | `#f4f4f5` | `#19191c` |
| `--c-ink` | `#17171a` | `#f4f4f5` |
| `--c-ink-soft` | `#52525b` | `#a1a1aa` |
| `--c-ink-faint` | `#63636b` | `#93939c` |
| `--c-line` | `#e4e4e7` | `#26262a` |
| `--c-line-strong` | `#c9c9ce` | `#3a3a41` |
| `--c-accent` | `#b83d0a` | `#fb8244` |
| `--c-accent-ink` | `#ffffff` | `#1a0d05` |
| `--c-accent-wash` | `#fdf0e8` | `#1e1210` |

Theme follows `prefers-color-scheme` until the visitor overrides it with the nav
toggle, which then persists in `localStorage` under `theme` and is applied as
`data-theme` on `<html>`.

The change itself is a View Transition: the incoming theme is clipped in as a
circle growing out of the toggle, to a radius that reaches the furthest corner.
`src/lib/theme.ts` hands `--wipe-x/y/r` to the `theme-wipe` keyframes, and writes
`data-theme` inside the transition callback rather than leaving it to React's
effect, because the snapshot is taken the moment that callback returns. Browsers
without the API, and anyone who has asked for less motion, get the instant swap.

Measured: 330 visible text nodes audited per theme, zero WCAG AA failures in
either, all three product skins included, with every colour resolved through a canvas so `color-mix` and `oklab`
values are compared as painted. Each run scores text against the worst backdrop
it can sit on: its own ancestors composited down to the page, and under them the
brightest point of the ambient glow. Transitions are disabled for the run:
sampling a colour mid-transition between two themes invents failures that do not
exist.

## Product skins

Three things on this page are real products with design systems of their own,
so each is shown wearing its own rather than repainted in this site's colours. A
skin (`.skin-corpus`, `.skin-vele`, `.skin-juggle` in `src/index.css`) redefines
this page's tokens for one subtree: every utility inside it keeps working and
simply resolves to that product's values.

Vele and Juggle both ship a light and a dark theme, so their skins follow the
page, and on a dark page they wear **their own** dark theme, never this site's.
This replaced an earlier rule that no skin followed the toggle: in practice a
white specimen on a dark page read as a light left on, not as fidelity. Prompt
Corpus is drawn in its dark theme on either page, the one it is known by, and it
sits comfortably on both. The dark values are copied verbatim from each
product's `globals.css`, under the same two selectors the page's own dark theme
uses.

Anything inside a skin that mixes colours mixes into the skin's own paper token,
never into a literal white. That was the bug that kept Vele's events bright: they
were mixed into `#ffffff`, which no theme can change.

| | Prompt Corpus | Vele | Juggle |
|---|---|---|---|
| Source | the live site's own `:root` | Vele's `globals.css` | Juggle's `globals.css` |
| Follows the page theme | no, dark on both | yes | yes |
| Paper | `#0b0a08` | `#fbfcfd` / `#0e131b` | `oklch(98.9% 0.004 85)` / `oklch(16.8% 0.006 62)` |
| Ink | `#ebe9e6` | `#1c2433` | `oklch(22% 0.013 62)` |
| Signal | `#f0a63c` amber | `#b53a17` red ink | `oklch(52.5% 0.142 49)` heat |
| Face | Literata | Libre Franklin | Geist, the same as this site |
| Corner | `rounded-xl` | `rounded-xl` | `0.25rem`, its own |
| Specimen | its curriculum panel: track, ticks, count | a week: six calendar inks, the red now line, one dashed block still in pencil | the rotation diagram |

Juggle is the awkward one, because it is also built in Geist. Its skin is kept in
the oklch its own stylesheet is written in, and what separates it from this page
is the warm canvas against this site's neutral zinc, a second signal colour for
failure that this site does not have at all, and sharp `0.25rem` corners where
everything here is soft. Type was not available as a difference, so the
structure carries it.

Nothing in either skin is a guess at their colours. The two faces are the only
reason `@fontsource-variable/literata` and `libre-franklin` are installed; the
rest of the page never uses them. Labels inside Vele's specimen are set in Libre
Franklin rather than mono, because Vele's interface has no mono in it.

## Type

Self-hosted through `@fontsource-variable`; no Google Fonts link tag. Two
files, three voices.

- **Geist Variable** does both display and reading. At display weight and
  display tracking it makes the page's statements; at reading weight it carries
  every paragraph. What separates the two is size, weight and tracking, not a
  second typeface.
- **Geist Mono Variable** carries anything that was measured or counted. Two
  utilities: `.tabular` for figures inside running text (dates, lesson counts,
  stacks) and `.meta` for a measured value that is also a label, at 11.5px with
  `0.09em` tracking, uppercase.

A display serif was tried for the statements and rejected. No serif anywhere.

One display ladder, in `src/index.css`, fluid between a phone and a large
desktop and capped so nothing ever clips:

| Step | Size | Used by |
|---|---|---|
| `--display-1` | `clamp(2.35rem, 5.2vw, 4.5rem)` | the hero sentence, and nothing else |
| `--display-2` | `clamp(1.95rem, 3.4vw, 2.9rem)` | every section title |
| `--display-3` | `clamp(1.4rem, 2.1vw, 1.8rem)` | titles inside a section |
| `--display-loud` | `clamp(2.75rem, 7vw, 4.75rem)` | the orange block only |

`.display` sets the voice (600 weight, `-0.035em`, balanced wrapping) and the
`.d*` classes set the step. Two cases need their own leading and carry it in the
same block rather than racing a Tailwind `leading-*` utility for it: `.d-loud`,
and `.d-mark` for the sign-off. Body sits at `1.0625rem` / `1.75`, with the
measure capped per block between `46ch` and `62ch`.

`.meta` is never used as an eyebrow above a heading. It labels table rows,
captions plates, names the current section in the nav, and sets the rail across
the foot of the first screen.

## Composition

Eleven sections, eleven distinct layout families; no family repeats.

1. Hero, a full first screen: the sentence at 7/12 against the live simulator,
   with a hairline rail of plain facts across the floor. The rail never wraps:
   narrower screens drop facts from the end (the three products come and go
   together), and on the very narrowest the long one shortens with an ellipsis
2. About, the title held in a 4/12 margin against a single reading column, the
   at-a-glance facts a two-column table beneath it rather than a sidebar
3. Work, an index of titles against a framed plate, no card chrome
4. Dashboards, horizontal scroll-snap gallery opening into a lightbox
5. Writing, the argument 5/7, then Prompt Corpus: the case on the left, its
   curriculum on the right as a specimen in Prompt Corpus's own design system
6. Vele, text and a facts rail over a full-width specimen of a week in Vele's
   own design system
7. Juggle, the only section that opens with a diagram rather than prose: the
   rotation loop first, then 7/5 prose against a facts rail. The shortest of the
   three product sections, because the diagram does the explaining
8. History, grouped chronology hung off a scroll-filled spine, then skills
9. Off the clock, six-cell bento with deliberate span variation
10. Assistant, centred single column of chat
11. Contact, split; the form inside a plate with its own caption bar

History earns its own rule because four groups of similar rows read as one list
without it: group headings are 22px semibold in full ink over a 2px ink rule,
separated by 80px, and the skills group switches to chips so it cannot be
mistaken for another chronology.

Zero eyebrows, against a budget of three. No section numbering. Grouping is done
with hairline rules and space rather than boxes; cards appear only where a cell
genuinely is a container (bento, dashboard tiles, the assistant panel).

Container is `.shell`: `max-w-[1240px]`, gutters `1.25rem` rising to `2rem`.
`.shell-inset` is its one variant, for the dashboard rail: the first card lines
up with the heading above it and the row runs off the right edge of the screen.
Its scroll padding matters as much as its padding, because a mandatory snap
point otherwise pulls the first card under the gutter on load.

Corner radius is one scale: `rounded-xl` for panels, `rounded-full` for controls.

The **plate** is the page's one container shape, used wherever something is
being shown rather than read: a bordered sheet holding the picture, then a
hairline, then a caption bar set in `.meta`. The hero simulator, every project
preview, each dashboard tile and the contact form are all built from it.

## Motion

`MOTION_INTENSITY: 5`. One grammar, plus a handful of moments that each say
something about the section they sit in. Everything is gated on
`useReducedMotion`, and none of it is load-bearing for reading.

- **Reveal** (`src/components/Reveal.tsx`): content is visible by default and
  lifts 16px as it enters, once, on an exponential ease-out. It communicates
  reading order and nothing else.
- **Theme wipe** (`src/lib/theme.ts`): see Colour.
- **Hero drift** (`Hero.tsx`): on the way out of the first screen the statement
  rises a little faster than the page and dims. Scroll-linked motion values, no
  listener.
- **Corpus ticks** (`Writing.tsx`) and **Vele's week** (`Vele.tsx`): one tick
  per lesson, drawn from the real counts; and a week of eight-hour days, solid
  where something is booked. Both draw in over roughly the same time. Decorative
  and `aria-hidden`: every count beside the ticks is written out, and the week is
  sample data, which its caption says.
- **Juggle's rotation loop** (`Juggle.tsx`): the page's one continuously running
  animation, and the only one that is load-bearing, because it is the
  explanation. A 10s loop carrying two requests on different keys, so the
  rotation is visible rather than asserted. Every window is an absolute
  percentage of the loop rather than an `animation-delay`, because a delayed loop
  wraps its own tail into the next pass and the timing stops being readable.
  Transform and opacity only. It runs only while it is on screen *and* the tab is
  in front — `usePlayWhenVisible` drives a `data-run` attribute and the CSS parks
  it with `animation-play-state`. Reduced motion gets a composed still frame, not
  the global rule's version: that rule collapses an animation to its last
  keyframe, which here is the empty gap between passes.
- **History spine** (`History.tsx`): the hairline the chronology hangs off fills
  with the accent as you read down it. With reduced motion it is drawn in full.
- **Chat launcher** (`src/components/ChatLauncher.tsx`): a labelled pill that
  arrives once the hero is behind you and retreats when the chat is on screen.
  Two IntersectionObservers, no scroll listeners.
- **Nav readout** (`Nav.tsx`): the mark keeps saying which section you are in.
  One observer over a band across the middle of the screen, and the last section
  to cross it wins, so the answer never flickers at a boundary.

A word-by-word glint on control labels was built and removed: it depended on
`background-clip: text` with a transparent fill, and the effect was not reliable
enough to earn its complexity.

No scroll listeners anywhere; entrance work goes through Motion's viewport
observers.

## Browser surfaces

Selection, caret, focus ring and scrollbars are all themed from the palette
rather than left at browser defaults. Focus is a 2px accent outline at 3px
offset.

## Background

Three layers behind the page:

- **Contour map** (`Terrain.tsx`): a topographic map of the page itself, drawn in
  WebGL2. The ground is slow drifting noise, rendered as a layered paper relief
  (Tanaka's illuminated contours): each contour is the edge of a sheet, lit on the
  side facing the light and casting a short shadow on the side away from it. The sun
  is in the north-west, as on printed maps; a mouse becomes a warm lamp for the edges
  near it. Clicking open ground raises a small hill that settles over a few seconds.

  It is built around the words. Every line box of text, every image, control and
  plate is measured into a layout mask, and each becomes a raised plateau that the
  contours swing round. Lines end about 24px short of any text, and any gap narrower
  than about 90px between two blocks stays empty, so nothing is ever drawn behind
  a word and no stray fragment is left between them. This replaced a halftone dot
  field whose dots sat under the text and swelled under the cursor; both made reading
  harder.

  Things that move against the page (the sticky About heading, the sticky Work
  preview, and the hero, marked `data-terrain-follow`) are measured relative to
  themselves and re-placed every frame. Transient inline offsets, such as a reveal
  caught mid-flight, are undone when measuring. The canvas lives in the document,
  not fixed to the screen, so it scrolls with the text on the compositor and can
  never lag it; it is about 1.8 screens tall and is moved and redrawn only near its
  edges. It renders in three passes: mask at a quarter of CSS resolution, ground at
  half, and contours at full. A full re-measure costs about 15ms and runs only on
  resize or a change in text. Reduced motion gets a still map with no lamp and no
  hills. Without WebGL2 and half-float render targets there is no map, and the page
  keeps its light and grain.
- **Ambient light** (`Ambient.tsx`): two huge soft lights, warm and cool. Each section
  has its own lighting recipe and the lights glide between recipes as you scroll, so
  the mood changes section by section. Motion values only, no scroll listener.
- **Grain** (`.grain`): static film grain, dark specks in light mode and light in dark.
  The orange section carries its own.

Glow colours are chosen so every text colour clears WCAG AA at the brightest point of
every light. That is why light mode uses pale apricot and pale slate, why the
light-mode accent is `#b83d0a`, and why faint text is `#63636b` (light) and `#93939c`
(dark).

The page ends on a giant outline wordmark (`Wordmark.tsx`), filled with the accent from
the left as far as the middle of the second "e" — half of ten letters. It is a fixed
state, not a scroll-driven one: it looks the same the moment it arrives. Where that "e"
falls is measured from the rendered glyph rather than hard-coded, so the stop holds at
every size and after the font loads.

The fill is clipped with a `polygon()` that runs from −60% to 160% of the element's
height, not an `inset()`. At this leading the glyphs overflow their own line box by about
a seventh of their size, and a clip that stops at the box edge shears the fill straight
across the letters — which is exactly what an earlier `inset(0 x% 0 0)` did. Only the
right-hand edge of that polygon is doing any work.

The last pixel of the page is the tail of the "y": the leading is tight enough to cut the
descender off, so `.d-mark` gives back exactly the `0.106em` the ink runs past its line
box, measured against the rendered face and set in `em` so it holds at every size. The
floating chat button hides once you have scrolled past the chat so it never covers it.

## Play

The page has one loud colour and one running joke, and they are the same thing:
Hot Wheels orange (`--color-hw`, `#f26a1b`, fixed across both themes).

- **The car** (`RaceCar.tsx`) is drawn for this site, not taken from an icon set:
  a 1:64 racer in profile, long and low, a bubble canopy set back, a winged tail,
  a bigger wheel at the back and three-spoke mags. One colour with the glass and a
  stripe cut out, so it reads on orange, on near-black and on the nav. The same
  car appears in both places below.
- **Scroll track** (`ScrollTrack.tsx`): the nav's bottom edge is an orange track. The
  car drives along it with reading progress, turns round when you scroll back up,
  and reaches a chequered flag at the bottom of the page. Motion values only; no
  state changes while scrolling apart from the car's heading.
- **Outside work** is the one drenched section: the whole block is orange, ink text
  at 6.2:1. It is the page's deliberate colour block, the only section that leaves
  the neutral theme.
- **Pull-back car** (`PullBackCar.tsx`): drag the car back and let go; pull distance
  sets how far it runs, and the card keeps your best run. Pulled back, it squats on
  its rear wheel; running, its wheels roll by exactly the distance travelled, so
  they never skid. A Launch button does the same for keyboard users.
- **Work index** (`Work.tsx`, `ProjectArt.tsx`): pick a project and a small scene
  plays: snowfall for the snow model, a spinning turbine for the jet engine twin, a
  night sky for NightOut, an idling electric car for JLR, a scrubber skipping
  chapters for the YouTube summariser. Illustrations are drawn from the icon set,
  never fake interface screenshots; the simulator uses its real screenshot. On small
  screens the preview opens inline under the chosen title.
- **"Oh well."** sits on its own line in the accent, at the same size as the
  sentence above it, and shrugs once shortly after load and again on hover.
- **The live badge**: the simulator's plate carries a pulsing dot marked Live.
  It is not decoration — the thing behind that poster really is running, and
  pressing play opens it.
- **Chat** types answers out against the clock (so a throttled background tab jumps
  ahead rather than crawling) and offers the next three unasked questions after
  every answer.

Every one of these is transform-only or decorative: if animation frames stop, all
text is still visible and every control still works.

## The live simulator

`src/components/LiveSim.tsx` embeds the real Living Ecosystem Simulator from
`living-ecosystem-simulator.onrender.com`, not a video or a screenshot. The hero
shows a still until someone presses Run it here, which opens the simulation in a
full-screen dialog at roughly 1190x600, because the simulator carries its own
control panel and cannot be used in a hero column.

The host sleeps, and its load event fires on the first HTML response while several
dozen sprite sheets are still arriving. The waking notice therefore outstays the
load event by 2.6 seconds, and its copy says the first run can take up to a minute.
Measured cold start: roughly 40 seconds.

## Known gaps

- No real photograph of Shreyas. The hero leads with the Living Ecosystem
  Simulator screenshot instead; the Minecraft-style avatar sits in the gaming
  cell where it reads as deliberate.
- No photograph of the Hot Wheels collection, so that cell is typographic with
  an accent wash.
- Five of the six projects have no imagery. They are typographic entries rather
  than fake previews.
