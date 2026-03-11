# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.1](https://github.com/ErickXavier/no-js/compare/v1.5.0...v1.5.1) — 2026-03-11

### Added

- Floating scroll-to-top button on mobile
- Doc tables horizontal scroll on mobile

### Changed

- Mobile nav popover alignment now uses header height CSS variable
- Language selector uses CSS grid 3-column layout
- GitHub/Discord links displayed side-by-side in mobile popover
- Code panel scrollability improvements (`overflow: auto`)
- CSS globalization: sidebar/doc-layout CSS moved from per-page files to global `style.css`
- CSS-to-template migration: moved per-page CSS from external files into template `<style>` blocks

### Removed

- "Get Started" CTA from mobile popover (low contrast issue)

### Fixed

- Mobile nav popover alignment

## [1.5.0](https://github.com/ErickXavier/no-js/compare/v1.4.3...v1.5.0) — 2026-03-11

### Added

- Discord community link in header nav icon, footer, FAQ sidebar, and FAQ CTA buttons
- `discord` translation key across all 5 locales (en, pt, es, fr, it) in `shell.json` and `faq.json`
- Community section in README with Discord and GitHub Discussions links
- Logo in README header with vertical alignment
- Changelog link in README Contributing section
- `CHANGELOG.md` with full version history (1.0.0–1.4.3)
- Dark logo assets: `logo-dark.svg`, `logo-dark.png`, `logo-dark-round.png`
- CHANGELOG update step in release agent workflow

### Changed

- Redesign footer as horizontal nav mirroring header menu (Features, Examples, FAQ, Playground, Docs, GitHub, Discord)
- Discord icon hover uses brand color (#5865F2)

## [1.4.3](https://github.com/ErickXavier/no-js/compare/v1.4.2...v1.4.3) — 2026-03-10

### Fixed

- Make `init()` idempotent — prevent double router creation when `cdn.js` auto-init and user scripts both call `NoJS.init()` ([`c71d290`](https://github.com/ErickXavier/no-js/commit/c71d290))

## [1.4.2](https://github.com/ErickXavier/no-js/compare/v1.4.0...v1.4.2) — 2026-03-10

### Changed

- Rewrite FAQ content across all 5 locales (en, pt, es, fr, it) with improved tone and accuracy ([`8b1c997`](https://github.com/ErickXavier/no-js/commit/8b1c997))

### Fixed

- Fix i18n locale persistence — saved locale from `localStorage` was being ignored on reload ([`8b1c997`](https://github.com/ErickXavier/no-js/commit/8b1c997))

## [1.4.0](https://github.com/ErickXavier/no-js/compare/v1.3.1...v1.4.0) — 2026-03-10

### Added

- Route prefetching and subtemplate cache warming ([`a71b63a`](https://github.com/ErickXavier/no-js/commit/a71b63a))
- FAQ page with full i18n support ([`a71b63a`](https://github.com/ErickXavier/no-js/commit/a71b63a))
- CSS split into modular files ([`a71b63a`](https://github.com/ErickXavier/no-js/commit/a71b63a))

### Changed

- Hide FAQ navigation links during initial setup ([`3cee1ee`](https://github.com/ErickXavier/no-js/commit/3cee1ee))

## [1.3.1](https://github.com/ErickXavier/no-js/compare/v1.3.0...v1.3.1) — 2026-03-09

### Added

- Locale keys for drag-and-drop docs, examples, and playground UI ([`5765bd8`](https://github.com/ErickXavier/no-js/commit/5765bd8))

## [1.3.0](https://github.com/ErickXavier/no-js/compare/v1.2.1...v1.3.0) — 2026-03-09

### Added

- Complete i18n coverage for all doc templates, playground demos, and locale JSON files ([`d762f00`](https://github.com/ErickXavier/no-js/commit/d762f00))
- `t=` directives on all doc templates with synced locale keys ([`49ce64c`](https://github.com/ErickXavier/no-js/commit/49ce64c))

## [1.2.1](https://github.com/ErickXavier/no-js/compare/v1.2.0...v1.2.1) — 2026-03-05

### Fixed

- GitHub link in `build.js` ([`62a1d0f`](https://github.com/ErickXavier/no-js/commit/62a1d0f))

## [1.2.0](https://github.com/ErickXavier/no-js/compare/v1.1.0...v1.2.0) — 2026-03-05

### Added

- Drag-and-drop system with `drag`, `drop`, `drag-disabled`, `drop-max` directives ([`0bc4490`](https://github.com/ErickXavier/no-js/commit/0bc4490))
- Interactive playground with live code editing ([`0bc4490`](https://github.com/ErickXavier/no-js/commit/0bc4490))
- Comprehensive codebase audit and documentation overhaul ([`0bc4490`](https://github.com/ErickXavier/no-js/commit/0bc4490))

## [1.1.0](https://github.com/ErickXavier/no-js/compare/v1.0.2...v1.1.0) — 2026-03-03

### Added

- File-based routing with `route-view` and `src` attributes ([`bb61fe7`](https://github.com/ErickXavier/no-js/commit/bb61fe7))
- External i18n locale loading from JSON files ([`bb61fe7`](https://github.com/ErickXavier/no-js/commit/bb61fe7))
- `t-html` directive for HTML content translation ([`bb61fe7`](https://github.com/ErickXavier/no-js/commit/bb61fe7))
- GitHub Actions workflow for automated npm publishing ([`270a4d0`](https://github.com/ErickXavier/no-js/commit/270a4d0))

### Fixed

- Memory leak cleanup in reactive watchers ([`4358b75`](https://github.com/ErickXavier/no-js/commit/4358b75))

## [1.0.2](https://github.com/ErickXavier/no-js/compare/v1.0.1...v1.0.2) — 2026-02-28

### Added

- End-to-end test suite with Playwright ([`12fec61`](https://github.com/ErickXavier/no-js/commit/12fec61))

### Fixed

- Reactive directive binding issues ([`12fec61`](https://github.com/ErickXavier/no-js/commit/12fec61))

## [1.0.1](https://github.com/ErickXavier/no-js/compare/v1.0.0...v1.0.1) — 2026-02-27

### Added

- Anchor links support in hash-mode documentation ([`db4b69d`](https://github.com/ErickXavier/no-js/commit/db4b69d))
- Custom domain (CNAME) configuration ([`a79c780`](https://github.com/ErickXavier/no-js/commit/a79c780))

## [1.0.0](https://github.com/ErickXavier/no-js/releases/tag/v1.0.0) — 2026-02-27

### Added

- Core reactive engine with `state`, `bind`, `show`, `hide`, `if`, `else`, `switch`, `case` directives
- Event handling with `on:` prefix
- `each` directive for list rendering
- `model` directive for two-way data binding
- CSS class bindings with `class-*` and `style-*` directives
- `fetch` directive for declarative data fetching
- Client-side router with hash and history modes
- i18n system with `t` directive
- Animation system with `animate` and `transition` directives
- Scoped context system with parent inheritance
- Filter system with `|` pipe syntax
- ~20 KB gzipped, zero dependencies
