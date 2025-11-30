<script lang="ts" module>
	import type { WidgetEditorModel, WidgetStrokeEditorModel } from '../types';
	import StrokeEditor from './stroke-editor.svelte';

	export type RectEditorModel = WidgetEditorModel;
</script>

<script lang="ts">
	let props: RectEditorModel = $props();
</script>

<StrokeEditor bind:model={props.stroke} />
