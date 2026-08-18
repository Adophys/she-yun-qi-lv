---
name: Phoenix Weave Narrative
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#45464f'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#757680'
  outline-variant: '#c5c6d0'
  surface-tint: '#4d5d8d'
  primary: '#011543'
  on-primary: '#ffffff'
  primary-container: '#1a2b58'
  on-primary-container: '#8393c7'
  inverse-primary: '#b5c5fb'
  secondary: '#b7102a'
  on-secondary: '#ffffff'
  secondary-container: '#db313f'
  on-secondary-container: '#fffbff'
  tertiary: '#2b1200'
  on-tertiary: '#ffffff'
  tertiary-container: '#4a2300'
  on-tertiary-container: '#cf8345'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c5fb'
  on-primary-fixed: '#041845'
  on-primary-fixed-variant: '#354573'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b1'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#92001c'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb780'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
  jade-green: '#2A9D8F'
  silver-metallic: '#C0C0C0'
  indigo-wash: '#354A81'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Noto Serif
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 16px
  margin-desktop: 24px
  gutter: 12px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system for this cultural mini-program bridges the ancient craftsmanship of the She people with cutting-edge mobile interaction. The brand personality is **vibrant, gamified, and explorative**, targeting a younger demographic that values both cultural heritage and technological immersion (AR/NFC).

The chosen style is **Modern Guochao (National Tide)**. It blends high-tech minimalism with tactile ethnic motifs. The interface utilizes a **Modern-Corporate** foundation for usability, layered with **Tactile/Skeuomorphic** elements specifically for interactive cultural artifacts, such as buttons that mimic woven fabric or silver jewelry. The aesthetic is clean and spacious but punctuated by dense, high-contrast embroidery patterns that guide the user's journey through the She villages.

## Colors
The palette is rooted in the "Phoenix Costume" of the She ethnic group. **Deep Indigo (#1A2B58)** serves as the primary structural color, providing depth and authority reminiscent of hand-dyed cloth. **Phoenix Red** and **Vibrant Orange** are used exclusively for high-priority actions and gamified milestones, mirroring traditional embroidery highlights.

**Jade Green** acts as a functional accent for success states and nature-related content. The background uses **Warm Rice White**, which reduces eye strain compared to pure white and provides a paper-like texture for cultural storytelling. Metallic silver accents should be used sparingly for borders or icon details to reference traditional She silver jewelry.

## Typography
The typographic hierarchy employs a "dual-soul" approach. **Noto Serif** is used for all headings and cultural titles to convey authority, history, and the elegance of traditional Chinese literature. It provides a sophisticated contrast to the modern interface.

**Plus Jakarta Sans** is the workhorse for body text, navigation, and labels. Its soft, rounded terminals keep the UI friendly and readable on small screens, balancing the seriousness of the serif titles with a contemporary, approachable feel. High-emphasis labels should use increased letter spacing to ensure clarity against vibrant backgrounds.

## Layout & Spacing
This design system uses a **fluid grid** optimized for WeChat Mini-Program viewports. The layout relies on a 4-column structure for mobile, with 16px side margins. 

Spacing follows a strict 4px base unit to ensure a mathematical rhythm. Vertical rhythm is driven by "Stack" tokens; use `stack-md` (16px) for most component grouping and `stack-lg` (32px) to separate major sections. Content should be contained within cards that utilize dynamic padding based on the internal complexity of the information (min 12px, max 20px).

## Elevation & Depth
Depth is created through **Tonal Layers** and **Subtle Textures** rather than heavy drop shadows. 
- **Level 1 (Base):** Warm Rice White background.
- **Level 2 (Cards/Containers):** Pure White (#FFFFFF) with a thin 0.5px border in `Indigo-Wash` at 10% opacity.
- **Level 3 (Interactive/Floating):** Ambient shadows using a tinted Indigo color (e.g., `rgba(26, 43, 88, 0.08)`) with a large blur radius (16px) and 0px offset.

For AR and gamified dialogue boxes, use a **Glassmorphism** effect with a background blur (10px) and a semi-transparent white fill (80%) to maintain legibility while suggesting a high-tech overlay.

## Shapes
The shape language is **Rounded**, reflecting the organic nature of She weaving and mountain landscapes. 
- **Standard Cards/Inputs:** 0.5rem (8px) corner radius.
- **Interactive Buttons:** 1rem (16px) or full-pill for a friendlier, gamified feel.
- **Motif Enclosures:** Use circular containers for embroidery icons to mimic traditional medallions.

## Components

### Gamified Buttons
Buttons should use a "Guochao" style: a solid Indigo or Red fill with a subtle 2px bottom "border-shadow" of a darker shade to create a tactile, pressable look. Primary buttons feature a "Woven Ribbon" pattern overlay at 5% opacity.

### Cultural Cards
Cards are the primary content vessel. They should feature a "header-strip" using a simplified mountain illustration or a phoenix pattern. Information is clearly segmented using `label-md` for metadata and `body-md` for descriptions.

### Thematic Icons
Icons are not standard line-art. They must incorporate geometric She embroidery motifs (diamonds, stars, phoenix tails). Use Indigo for inactive states and Phoenix Red/Orange for active states.

### Tab Bar & AR Center
The Tab Bar features a centered, oversized circular button for AR. This button should have a metallic silver gradient ring and a glowing "Aura" effect to signify its importance.

### Floating Dialogue Boxes
Used for the IP character, these use the Rice White fill with a 2px Jade Green accent border. The "tail" of the bubble should be rounded to match the general shape language.

### List Items
List items should be separated by a "Stitch" divider—a dashed line that mimics embroidery thread instead of a solid gray line.