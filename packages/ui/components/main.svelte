<style>
  :global(:root) {
    --gd-base-color: hsl(214, 35%, 21%);
    --gd-tint-5pct: hsla(214, 65%, 85%, 0.06);
    --gd-tint-10pct: hsla(214, 60%, 80%, 0.14);
    --gd-tint-20pct: hsla(214, 64%, 82%, 0.23);
    --gd-tint-30pct: hsla(214, 69%, 84%, 0.32);
    --gd-tint-40pct: hsla(214, 73%, 86%, 0.41);
    --gd-tint-50pct: hsla(214, 78%, 88%, 0.5);
    --gd-tint-60pct: hsla(214, 82%, 90%, 0.58);
    --gd-tint-70pct: hsla(214, 87%, 92%, 0.69);
    --gd-tint-80pct: hsla(214, 91%, 94%, 0.8);
    --gd-tint-90pct: hsla(214, 96%, 96%, 0.9);
    --gd-tint: hsl(214, 100%, 98%);
    --gd-shade-5pct: hsla(214, 0%, 0%, 0.07);
    --gd-shade-10pct: hsla(214, 4%, 2%, 0.15);
    --gd-shade-20pct: hsla(214, 8%, 4%, 0.23);
    --gd-shade-30pct: hsla(214, 12%, 6%, 0.32);
    --gd-shade-40pct: hsla(214, 16%, 8%, 0.41);
    --gd-shade-50pct: hsla(214, 20%, 10%, 0.5);
    --gd-shade-60pct: hsla(214, 24%, 12%, 0.6);
    --gd-shade-70pct: hsla(214, 28%, 13%, 0.7);
    --gd-shade-80pct: hsla(214, 32%, 13%, 0.8);
    --gd-shade-90pct: hsla(214, 33%, 13%, 0.9);
    --gd-shade: hsl(214, 33%, 13%);
    --gd-contrast-5pct: var(--gd-tint-5pct);
    --gd-contrast-10pct: var(--gd-tint-10pct);
    --gd-contrast-20pct: var(--gd-tint-20pct);
    --gd-contrast-30pct: var(--gd-tint-30pct);
    --gd-contrast-40pct: var(--gd-tint-40pct);
    --gd-contrast-50pct: var(--gd-tint-50pct);
    --gd-contrast-60pct: var(--gd-tint-60pct);
    --gd-contrast-70pct: var(--gd-tint-70pct);
    --gd-contrast-80pct: var(--gd-tint-80pct);
    --gd-contrast-90pct: var(--gd-tint-90pct);
    --gd-contrast: var(--gd-tint);
    --gd-header-text-color: var(--gd-contrast);
    --gd-body-text-color: var(--gd-contrast-90pct);
    --gd-secondary-text-color: var(--gd-contrast-70pct);
    --gd-tertiary-text-color: var(--gd-contrast-50pct);
    --gd-disabled-text-color: var(--gd-contrast-30pct);
    --gd-primary-color: hsl(214, 90%, 48%);
    --gd-primary-color-50pct: hsla(214, 90%, 70%, 0.69);
    --gd-primary-color-10pct: hsla(27, 93%, 32%, 0.13);
    --gd-primary-text-color: hsl(214, 90%, 77%);
    --gd-primary-contrast-color: #fff;
    --gd-error-color: hsl(3, 79%, 49%);
    --gd-error-color-50pct: hsla(3, 75%, 62%, 0.5);
    --gd-error-color-10pct: hsla(3, 75%, 62%, 0.14);
    --gd-error-text-color: hsl(3, 100%, 80%);
    --gd-success-color: hsl(145, 72%, 30%);
    --gd-success-color-50pct: hsla(145, 92%, 51%, 0.5);
    --gd-success-color-10pct: hsla(145, 92%, 51%, 0.1);
    --gd-success-text-color: hsl(145, 85%, 46%);

    --gd-font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI",
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
    --gd-font-size-xxs: 0.75rem;
    --gd-font-size-xs: 0.8125rem;
    --gd-font-size-s: 0.875rem;
    --gd-font-size-m: 1rem;
    --gd-font-size-l: 1.125rem;
    --gd-font-size-xl: 1.375rem;
    --gd-font-size-xxl: 1.75rem;
    --gd-font-size-xxxl: 2.5rem;
    --gd-line-height-xs: 1.25;
    --gd-line-height-s: 1.375;
    --gd-line-height-m: 1.625;

    --gd-size-xs: 1.625rem;
    --gd-size-s: 1.875rem;
    --gd-size-m: 2.25rem;
    --gd-size-l: 2.75rem;
    --gd-size-xl: 3.5rem;
    --gd-icon-size-s: 1.25em;
    --gd-icon-size-m: 1.5em;
    --gd-icon-size-l: 2.25em;
    --gd-icon-size: var(--gd-icon-size-m);
    --gd-button-size: var(--gd-size-l);

    --gd-border-radius-s: 0.25em;
    --gd-border-radius-m: var(--gd-border-radius, 0.25em);
    --gd-border-radius-l: 0.5em;
    --gd-border-radius: 0.25em;
    --gd-box-shadow-xs: 0 1px 4px -1px var(--gd-shade-50pct);
    --gd-box-shadow-s: 0 2px 4px -1px var(--gd-shade-20pct),
      0 3px 12px -1px var(--gd-shade-30pct);
    --gd-box-shadow-m: 0 2px 6px -1px var(--gd-shade-20pct),
      0 8px 24px -4px var(--gd-shade-40pct);
    --gd-box-shadow-l: 0 3px 18px -2px var(--gd-shade-20pct),
      0 12px 48px -6px var(--gd-shade-40pct);
    --gd-box-shadow-xl: 0 4px 24px -3px var(--gd-shade-20pct),
      0 18px 64px -8px var(--gd-shade-40pct);
    --gd-clickable-cursor: default;

    --gd-size-xs: 1.625rem;
    --gd-size-s: 1.875rem;
    --gd-size-m: 2.25rem;
    --gd-size-l: 2.75rem;
    --gd-size-xl: 3.5rem;
    --gd-icon-size-s: 1.25em;
    --gd-icon-size-m: 1.5em;
    --gd-icon-size-l: 2.25em;
    --gd-icon-size: var(--gd-icon-size-m);
  }
</style>
