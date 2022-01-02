<script>
    import "@vaadin/button"
    import { setAttributes } from "@utils";

    var name = "GDLauncher"

</script>

<div class="main">
    <h1>GDLauncher</h1>
	<vaadin-button use:setAttributes={{ theme: "primary success" }}>Primary</vaadin-button>
    <h1>Welcome to {name}!</h1>
</div>

<style>
    .main {
        text-align: center;
        margin: 50px auto;
    }

    img {
        max-width: 100%;
    }
</style>