# Components

## ProgramCard

`src/lib/components/programs/ProgramCard.svelte` renders a linked program preview for program listing surfaces. Its visual treatment follows the home-page `ProgramBento` card language: rounded image-first cards, white or dark surfaces, soft slate elevation, compact category pills, display-weight titles, and a circular arrow action that moves on hover or keyboard focus.

Props:

- `program: ProgramPreview`
- `index?: number` controls the reveal delay and entrance direction.

The card surfaces the first available quick metadata value from `schedule`, `location`, or `audience`.

## Hero

`src/lib/components/Hero.svelte` renders the landing-page image slider and discovery shortcuts. The hero adapts from a full image-led mobile layout to a main-slide and preview-rail desktop layout.

The slider uses one persistent bottom control rail at every viewport size. It supports previous, next, direct slide selection, and horizontal swipe gestures with keyboard-visible focus states. It pauses autoplay while the user interacts with it, disables autoplay when reduced motion is requested, and condenses nonessential copy on short landscape screens.
