<script>
  import "./main.svelte";
  export let icon;
  export let slot;
  export let size;
  export let onClick;

  function handleClick() {}
  const mapSizeToVar = (size) => {
    switch (size) {
      case "large":
        return "var(--lumo-size-l)";
      case "medium":
        return "var(--lumo-size-m)";
      case "small":
        return "var(--lumo-size-s)";
      default:
        return "var(--lumo-size-m)";
    }
  };
  const mapSizeToFontSize = (size) => {
    switch (size) {
      case "large":
        return "var(--lumo-font-size-l)";
      case "medium":
        return "var(--lumo-font-size-m)";
      case "small":
        return "var(--lumo-font-size-s)";
      default:
        return "var(--lumo-font-size-m)";
    }
  };
</script>

<div
  on:click={() => onClick()}
  class="button"
  style="--lumo-button-size: {mapSizeToVar(
    size
  )}; font-size: {mapSizeToFontSize(size)}"
  on:click={handleClick}
>
  <div class="button-container">
    <span class="prefix">
      {#if slot === "prefix"}
        {icon}
      {/if}
    </span>
    <span class="label">
      <slot />
    </span>
    <span class="suffix">
      {#if slot === "suffix"}
        {icon}
      {/if}
    </span>
  </div>
</div>

<style>
  .button {
    cursor: pointer;
    user-select: none;
    min-width: calc(var(--lumo-button-size) * 2);
    height: var(--lumo-button-size);
    padding: 0
      calc(var(--lumo-button-size) / 3 + var(--lumo-border-radius-m) / 2);
    margin: var(--lumo-space-xs) 0;
    box-sizing: border-box;
    font-family: var(--lumo-font-family);
    font-size: var(--lumo-font-size-m);
    font-weight: 500;
    color: var(--_lumo-button-color, var(--lumo-primary-text-color));
    background-color: var(
      --_lumo-button-background-color,
      var(--lumo-contrast-5pct)
    );
    border-radius: var(--lumo-border-radius-m);
    cursor: var(--lumo-clickable-cursor);
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
  }

  @keyframes glow {
    from {
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }
    to {
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
    }
  }

  .button:active {
    -webkit-animation: glow 0.1s ease-in-out;
    -moz-animation: glow 0.1s ease-in-out;
    animation: glow 0.1s ease-in-out;
  }

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
</style>
