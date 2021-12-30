<script>
  import "./main.svelte";

  export let variant;
  export let theme;
  export let icon;
  export let slot;
  export let size;
  export let onClick;

  let glow = false;

  const mapSizeToVar = (size) => {
    switch (size) {
      case "large":
        return "var(--gd-size-l)";
      case "medium":
        return "var(--gd-size-m)";
      case "small":
        return "var(--gd-size-s)";
      default:
        return "var(--gd-size-m)";
    }
  };
  const mapSizeToFontSize = (size) => {
    switch (size) {
      case "large":
        return "var(--gd-font-size-l)";
      case "medium":
        return "var(--gd-font-size-m)";
      case "small":
        return "var(--gd-font-size-s)";
      default:
        return "var(--gd-font-size-m)";
    }
  };
</script>

<div style="position: relative;">
  {#if variant === "primary"}
    <div class="overlay" />
  {/if}
  <div
    on:click={() => {
      if (onClick) onClick();
    }}
    on:mouseup={() => {
      glow = true;
      setTimeout(() => {
        glow = false;
      }, 100);
    }}
    class="button {variant}"
    class:glow
    style="--gd-button-size: {mapSizeToVar(size)}; 
  font-size: {mapSizeToFontSize(size)};
  {theme && `background-color: var(--gd-${theme}-color);`}
  "
  >
    <div class="button-container">
      <span class="prefix">
        {#if slot === "prefix" && icon}
          {icon}
        {/if}
      </span>
      <span class="label">
        <slot />
      </span>
      <span class="suffix">
        {#if slot === "suffix" && icon}
          {icon}
        {/if}
      </span>
    </div>
  </div>
</div>

<style>
  .button {
    position: relative;
    cursor: pointer;
    user-select: none;
    min-width: calc(var(--gd-button-size) * 2);
    height: var(--gd-button-size);
    padding: 0 calc(var(--gd-button-size) / 3 + var(--gd-border-radius-m) / 2);
    margin: var(--gd-space-xs) 0;
    box-sizing: border-box;
    font-family: var(--gd-font-family);
    font-size: var(--gd-font-size-m);
    font-weight: 500;
    color: var(--_gd-button-color, var(--gd-primary-text-color));
    background-color: var(
      --_gd-button-background-color,
      var(--gd-contrast-5pct)
    );
    border-radius: var(--gd-border-radius-m);
    cursor: var(--gd-clickable-cursor);
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    transition: opacity ease-in-out 0.1s;
  }

  .button:hover {
    opacity: 0.95;
  }
  .button:active {
    opacity: 0.88;
  }

  .overlay {
    position: absolute;
    background: black;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: var(--gd-border-radius-m);
  }

  @keyframes glow {
    from {
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }
    to {
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
    }
  }

  @keyframes glowPrimary {
    from {
      /* text-shadow: 0 0 30px rgba(255, 255, 255); */
      text-shadow: 0 0 10px rgb(255, 255, 255), 0 0 20px rgb(255, 255, 255),
        0 0 30px rgb(255, 255, 255);
    }
    to {
      text-shadow: 0 0 20px rgb(255, 255, 255), 0 0 30px rgb(255, 255, 255),
        0 0 40px rgb(255, 255, 255);
    }
  }

  .glow {
    animation: glowPrimary 0.1s ease-in-out;
  }

  /* .button:active {
    -webkit-animation: glow 0.1s ease-in-out;
    -moz-animation: glow 0.1s ease-in-out;
    animation: glow 0.1s ease-in-out;
  } */

  .button-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
    min-height: inherit;
    text-shadow: inherit;
    background: transparent;
    padding: 0;
    border: none;
    box-shadow: none;
  }

  .primary {
    background-color: var(
      --_gd-button-primary-background-color,
      var(--gd-primary-color)
    );
    color: var(--_gd-button-primary-color, var(--gd-primary-contrast-color));
    font-weight: 600;
    min-width: calc(var(--gd-button-size) * 2.5);
  }
  /* 
  .primary:active {
    -webkit-animation: glowPrimary 0.4s ease-in-out !important;
    -moz-animation: glowPrimary 0.4s ease-in-out !important;
    animation: glowPrimary 0.4s ease-in-out !important;
  } */

  .third {
    padding: 0 calc(var(--gd-button-size) / 6);
    background-color: transparent !important;
    min-width: 0;
  }
</style>
