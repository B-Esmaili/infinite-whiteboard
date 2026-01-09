<script lang="ts">
	const { props } = $props();

	$effect(() => {
		props && console.log(JSON.stringify(props.x1.x2.y));
	});
</script> 