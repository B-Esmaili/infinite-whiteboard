<script lang="ts">
	import { drawRect } from '@lib/infinite-whiteboard/helpers/drawing-helper';

	import { Application, Container, Graphics, RenderLayer } from 'pixi.js';

	// Create a new application
	const app = new Application();
	const container = new Container();
	container.x = 0;
	container.y = 0;

	const container2 = new Container({ isRenderGroup: true });
	container2.x = 0;
	container2.y = 0;
	container.angle = 45;
	app.stage.addChild(container);
	app.stage.addChild(container2);

	$effect(() => {
		(async () => {
			// Initialize the application
			await app.init({ background: '#1099bb', resizeTo: window });

			// Append the application canvas to the document body
			document.body.appendChild(app.canvas);

			// Create and add a container to the stage

			// Load the bunny texture

			// Create a 5x5 grid of bunnies in the container

			// Move the container to the center
			//container.x = app.screen.width / 2;
			//container.y = app.screen.height / 2;

			// Center the bunny sprites in local container coordinates
			container2.origin.set(100, 100);

			const rect = new Graphics();
			container.addChild(rect);

			drawRect(rect, 0, 0, 200, 200, {
				fill: '#f00',
				stroke: '#f0f'
			});

			//container.addChild(rect);

			// Listen for animate update
			// app.ticker.add((time) => {
			// 	// Continuously rotate the container!
			// 	// * use delta to create frame-independent transform *
			// 	container.rotation -= 0.01 * time.deltaTime;
			// });
			// setTimeout(() => {
			// 	container2.reparentChild(rect);
			// }, 2000);

			setTimeout(() => {
				const rect2 = new Graphics();
				drawRect(rect2,100,100,200,200);
				container.addChild(rect2);
			}, 3000);

			// container2.pivot.set(container2.width / 2, container2.height / 2);

			app.ticker.add((delta) => {
				container.angle += 0.05;
			});
		})();
	});
</script>

<button> rotate </button>

<style>
	button {
		position: fixed;
		left: 50%;
		right: 50%;
		z-index: 9999;
		background: #f95;
	}
</style>
