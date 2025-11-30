<script lang="ts" module>
	import type { Component } from 'svelte';

	export interface EditorPanelProps {
		editor: Component;
		editorModel: Record<PropertyKey, unknown>;
	}
</script>

<script lang="ts">
	let props: EditorPanelProps = $props();
</script>

<div>
	<props.editor model={props.editorModel} />
</div>
