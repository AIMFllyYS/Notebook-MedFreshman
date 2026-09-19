---
name: studysolo-glass-design
description: Use this skill to generate well-branded interfaces and assets for StudySolo Glass — a macOS-native deep-glassmorphism study workspace with an embedded AI Agent. Contains essential design guidelines, colors, type, fonts, and UI kit components for prototyping dashboard UIs.
user-invocable: true
---

# StudySolo Glass Design Skill

Read `README.md` first, then explore the files in the quick map. For visual artifacts (mocks, slides, throwaway prototypes), copy assets and build static HTML; for production code, treat the rules here as the binding design contract.

If invoked with no other guidance, ask what to build, then act as an expert designer shipping HTML artifacts _or_ production code.

## Quick map

- `README.md` — brand context, content fundamentals, visual foundations
- `css.json` — structured token understanding source (read this for tokens)
- `colors_and_type.css` — drop-in runtime CSS variables; link it, do not parse it when css.json exists
- `components/index.json` + `components/{slug}.json` — component intent and variants; consume `preview/component-{slug}.html` FIRST for DOM/CSS fidelity, contract JSON second
- `components.css` — aggregated component CSS behind the preview pages
- `preview/` — standalone HTML card per component
- `ui_kits/dashboard/index.html` — full click-thru dashboard reference for layout and density
- `library-consumption.json` — recommended downstream read order

## Essentials at a glance

- Three glass themes: `.dark` is the DEFAULT — warm charcoal page `#2b2926`, text `#f2ede6`, panel fill `rgba(255,255,255,0.10)`; `:root` is misty aqua light — page `#e7eef6`, text `#1f2733`, white glass 0.55–0.70; `[data-tint="cream"]` is warm butter light — page `#f7f1e3`, text `#47361f`, fills `rgba(255,252,243,0.55–0.72)`.
- Glass six-pack: window / sidebar / panel / popover / control fills plus one shared white hairline border — light 0.60 / 0.55 / 0.62 / 0.70 / 0.66 over `rgba(255,255,255,0.65)`; dark collapses to 0.06 / 0.08 / 0.10 / 0.18 / 0.14 over `rgba(255,255,255,0.08)`.
- Blur in three tiers only: thin `20px` (controls), base `32px` (panels, menus, tabs), deep `48px` (windows, popovers), always paired with `saturate(180%)`; windows add `brightness(106%)`.
- Radius: window `28px`, panel `18px`, small panel/menu `12px`, control `10px`, `9999px` pills for buttons, search, segmented and dots — glass is never square.
- macOS-native heights: titlebar 44px, menu bar and menu rows 28px, buttons 30 / 36 / 44px, input 36px, 12px traffic lights in honest `#ff5f57` / `#febc2e` / `#28c840` (grey `#7d7d7d` when window is inactive).
- Type: Inter (400–700) for all UI, JetBrains Mono (400/500) for kbd, code and data, PingFang SC for Chinese glyphs; body 15px/1.6, caption 12px, display 40px/700.
- Primary blue `#2563eb` light / `#6aa6ff` dark; the primary button inverts to become the one opaque moment — white fill on dark, ink fill on light; burnt-orange accent `#d9542c` / `#e27d52` reserved for danger and the close light.
- Depth comes from blur tiers, the 1px top inner highlight (`inset 0 1px 0 rgba(255,255,255,0.14)` dark / `0.75` light) and blue-tinted soft shadows; separators are hairlines, never flat opaque cards.
- Performance rule: ONE blurred backdrop layer per nesting level — nested panes reuse the parent blur with denser fills instead of stacking `backdrop-filter`.
- Voice: bilingual zh-first, terse macOS-style labels ("新对话", "深度思考", "智能讲解", "搜索课程、笔记、对话"); English only for product nouns like Agent / Work / Chat.

## Components

| slug | name | key insight |
|---|---|---|
| button | Glass Button | White in dark, ink in light — the one opaque primary moment |
| input-field | Glass Input Field | Shallow at rest, deepens on focus; composer is the hero control |
| glass-panel | Glass Panel | Depth from blur tiers, one blurred layer per nesting level |
| mac-window | Mac Window | 28px glass + honest traffic lights, everything else quiet |
| menu-bar | Mac Menu Bar & Menus | Densest glass, 28px rows, one tinted hover wash |
| tab-bar | Glass Tab Bar & Segmented | Active tab rises; white pill thumb in a glass track |
