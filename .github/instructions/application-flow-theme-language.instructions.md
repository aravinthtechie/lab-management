---
description: "Use when changing application behavior, authentication, routing, navigation, themes, colors, language selection, or translations in this lab management app. Documents the current functional flow and theme/language conventions."
---

# Application Flow, Theme, and Language

## Application flow

- The root component initializes shared toast and theme services, then renders the router outlet.
- `/login` is the unauthenticated entry point. Authenticated application routes are children of the shell route and protected by `authGuard`.
- `authGuard` allows navigation when `AuthService.isLoggedIn()` is true; otherwise it redirects to `/login`.
- The shell owns the shared sidebar, header, language and theme switchers, user menu, footer, and child route outlet. Keep shared navigation and shell behavior consistent across every child page.
- `MENU` in `src/app/core/menu/menu.ts` is the source for sidebar entries and labels. Keep menu paths aligned with route paths. Respect `adminOnly` filtering in the shell.
- Feature routes may be lazy-loaded or directly imported. Preserve the existing route structure and redirect behavior when adding or changing pages.
- Login stores authentication values in local or session storage according to the Remember Me choice. Logout clears auth keys but intentionally preserves theme and language preferences.

## Theme behavior

- `ThemeService` in `src/app/core/theme/theme.service.ts` owns the current theme and theme changes. Use its `current`, `themes`, and `set()` API instead of manipulating theme classes from components.
- `THEMES` in `src/app/core/theme/themes.ts` defines the supported theme IDs, labels, and switcher swatches. Keep IDs unique and make sure each ID has corresponding styles.
- The selected theme is persisted under `app-theme`; when no valid selection is stored, the system dark-mode preference chooses `dark`, otherwise `light`.
- The service applies exactly one `theme-<id>` class to the document root. Define global theme tokens in `src/styles.scss` under that root class.
- Components should consume shared Material system tokens (`--mat-sys-*`) and existing lab tokens (`--lab-*`) rather than hardcoding theme-specific colors. Add or adjust tokens for intentional visual differences; do not override a theme globally with unrelated selectors.
- Verify theme changes in the shell and representative feature pages, including controls, headers, surfaces, borders, and text contrast. Do not remove supported themes or change the default without an explicit request.

## Language behavior

- `LanguageService` in `src/app/core/i18n/language.service.ts` owns the selected language. Supported values are `en` and `ta`; persist the choice under `labcare-language`.
- Use `LanguageSwitcherComponent` to change languages and `TranslatePipe` (`| translate`) for user-facing strings in templates.
- Translation entries live in `src/app/core/i18n/translations.json`. When adding or changing displayed text, provide the corresponding translations for every supported language and preserve the original key fallback behavior.
- Keep accessible labels and status messages localized where the existing interface uses translations.
- Do not add a second language state, storage key, or direct DOM translation mechanism.

## Change safety

- Read the existing service, switcher, route, and component patterns before changing behavior.
- Keep authentication, authorization, navigation, theme, and language concerns in their existing core services; avoid coupling feature pages to each other's state.
- Preserve existing functional behavior unless the request explicitly asks to change it. Report any intentionally changed defaults or persistence behavior.
- After changes, run the smallest relevant tests or build and check for regressions in route loading and shared shell behavior.
