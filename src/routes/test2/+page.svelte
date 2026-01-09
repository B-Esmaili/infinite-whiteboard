<script lang="ts">
	import { mount } from 'svelte';
	import type { PageProps } from './$types';
	import TestComp from './TestComp.svelte';

	let { data }: PageProps = $props();

	let x = $state([
		 
	]);


    function doMount(){
        mount(TestComp);
    }

</script>

<button onclick={() => (x[0].x1.x2.y = 'aaaaaaaaaaaaaaa')}> click </button>
<button onclick={doMount}> mount </button>
<!-- <TestComp props={x} /> -->
