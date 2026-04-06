import themeConfig from '../theme.config.json';

type ThemeKey = keyof typeof themeConfig.themes;

/**
 * Reads theme.config.json and returns a CSS custom properties string.
 * Applied as a <style> tag in layout.tsx — no rebuild needed, just restart dev server.
 */
export function getThemeCssVars(): string {
  const themeName = themeConfig.activeTheme as ThemeKey;
  const theme = themeConfig.themes[themeName];
  const radius = themeConfig.borderRadius;

  const vars = `
    :root {
      --color-primary:        ${theme.primary};
      --color-primary-glow:   ${theme.primaryGlow};
      --color-secondary:      ${theme.secondary};
      --color-secondary-glow: ${theme.secondaryGlow};
      --color-accent:         ${theme.accent};
      --color-accent-glow:    ${theme.accentGlow};
      --color-success:        ${theme.success};

      --radius-widget:  ${radius.widget};
      --radius-button:  ${radius.button};
      --radius-chart:   ${radius.chart};
      --radius-badge:   ${radius.badge};

      --orb1: ${theme.orb1};
      --orb2: ${theme.orb2};
      --orb3: ${theme.orb3};
    }

    /* Dark mode (default) */
    :root, .dark {
      --bg:              ${theme.backgroundDark};
      --surface:         ${theme.surfaceDark};
      --border-color:    ${theme.borderDark};
      --heading-color:   ${theme.headingDark};
      --text:            rgba(255, 255, 255, 0.90);
      --text-muted:      rgba(255, 255, 255, 0.45);
    }

    /* Light mode */
    .light {
      --bg:              ${theme.backgroundLight};
      --surface:         ${theme.surfaceLight};
      --border-color:    ${theme.borderLight};
      --heading-color:   ${theme.headingLight};
      --text:            rgba(0, 0, 0, 0.85);
      --text-muted:      rgba(0, 0, 0, 0.45);
    }
  `;

  return vars.trim();
}

export const activeThemeName = themeConfig.activeTheme;
