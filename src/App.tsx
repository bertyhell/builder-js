import React, { useEffect, useRef } from 'react';
import './App.scss';
import {
	// CannonJSPlugin,
	Color3,
	Engine,
	GlowLayer,
	HemisphericLight,
	MeshBuilder,
	PhysicsImpostor,
	PointLight,
	Scene,
	StandardMaterial,
	UniversalCamera,
	Vector3,
} from '@babylonjs/core';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
// import * as CANNON from 'cannon-es';

// const cannonPlugin = new CannonJSPlugin(true, 10, CANNON);

function App() {
	const reactCanvas = useRef(null);

	const onSceneReady = (scene: Scene) => {
		const canvas = scene.getEngine().getRenderingCanvas();

		//Camera

		// Parameters : name, position, scene
		const camera = new UniversalCamera('UniversalCamera', new Vector3(0, 2, -25), scene);

		// Targets the camera to a particular position. In this case the scene origin
		camera.setTarget(Vector3.Zero());

		// Attach the camera to the canvas
		camera.applyGravity = true;
		camera.ellipsoid = new Vector3(0.4, 0.8, 0.4);
		camera.checkCollisions = true;
		camera.attachControl(canvas, true);

		//Hero

		const hero = Mesh.CreateBox('hero', 2.0, scene, false, Mesh.FRONTSIDE);
		hero.position.x = 0.0;
		hero.position.y = 1.0;
		hero.position.z = 0.0;
		// hero.physicsImpostor = new PhysicsImpostor(
		// 	hero,
		// 	PhysicsImpostor.BoxImpostor,
		// 	{
		// 		mass: 1,
		// 		restitution: 0.0,
		// 		friction: 0.1,
		// 	},
		// 	scene
		// );
		// hero.physicsImpostor.physicsBody.fixedRotation = true;
		// hero.physicsImpostor.physicsBody.updateMassProperties();

		// pointer
		const pointer = Mesh.CreateSphere('Sphere', 16.0, 0.01, scene, false, Mesh.DOUBLESIDE);
		// move the sphere upward 1/2 of its height
		pointer.position.x = 0.0;
		pointer.position.y = 0.0;
		pointer.position.z = 0.0;
		pointer.isPickable = false;

		let moveForward = false;
		let moveBackward = false;
		let moveRight = false;
		let moveLeft = false;

		const onKeyDown = function (event: KeyboardEvent) {
			switch (event.keyCode) {
				case 38: // up
				case 87: // w
					moveForward = true;
					break;

				case 37: // left
				case 65: // a
					moveLeft = true;
					break;

				case 40: // down
				case 83: // s
					moveBackward = true;
					break;

				case 39: // right
				case 68: // d
					moveRight = true;
					break;

				case 32: // space
					break;
			}
		};

		const onKeyUp = function (event: KeyboardEvent) {
			switch (event.keyCode) {
				case 38: // up
				case 87: // w
				case 90: // z
					moveForward = false;
					break;

				case 37: // left
				case 65: // a
				case 81: // q
					moveLeft = false;
					break;

				case 40: // down
				case 83: // s
					moveBackward = false;
					break;

				case 39: // right
				case 68: // d
					moveRight = false;
					break;
			}
		};

		document.addEventListener('keydown', onKeyDown, false);
		document.addEventListener('keyup', onKeyUp, false);

		scene.registerBeforeRender(function () {
			//Your code here
			//Step
			//let stats = document.getElementById("stats");
			//stats.innerHTML = "";

			camera.position.x = hero.position.x;
			camera.position.y = hero.position.y + 1.0;
			camera.position.z = hero.position.z;
			pointer.position = camera.getTarget();

			const forward = camera.getTarget().subtract(camera.position).normalize();
			forward.y = 0;
			const right = Vector3.Cross(forward, camera.upVector).normalize();
			right.y = 0;

			const SPEED = 20;
			let f_speed = 0;
			let s_speed = 0;
			const u_speed = 0;

			if (moveForward) {
				f_speed = SPEED;
			}
			if (moveBackward) {
				f_speed = -SPEED;
			}

			if (moveRight) {
				s_speed = SPEED;
			}

			if (moveLeft) {
				s_speed = -SPEED;
			}

			// const move = forward
			// 	.scale(f_speed)
			// 	.subtract(right.scale(s_speed))
			// 	.subtract(camera.upVector.scale(u_speed));
			//
			// if (!hero.physicsImpostor) {
			// 	console.error('Failed to init hero.physicsImpostor');
			// 	return;
			// }

			// hero.physicsImpostor.physicsBody.velocity.x = move.x;
			// hero.physicsImpostor.physicsBody.velocity.z = move.z;
			// hero.physicsImpostor.physicsBody.velocity.y = move.y;
		});

		/*//WASD
		camera.keysUp.push(87);
		camera.keysDown.push(83);
		camera.keysRight.push(68);
		camera.keysLeft.push(65);
		*/

		//Jump
		/* function jump(){
		   hero.physicsImpostor.applyImpulse(new Vector3(1, 20, -1), hero.getAbsolutePosition());
		 }

		 document.body.onkeyup = function(e){
		   if(e.keyCode == 32){
			 //your code
			 console.log("jump");
			 setTimeout(jump(), 10000);

		   }
		 }*/

		//Mouse
		//We start without being locked.
		let isLocked = false;

		// On click event, request pointer lock
		scene.onPointerDown = function (evt) {
			if (!canvas) {
				console.error('Failed to get canvas');
				return;
			}
			//true/false check if we're locked, faster than checking pointerlock on each single click.
			if (!isLocked) {
				canvas.requestPointerLock =
					canvas.requestPointerLock ||
					canvas.msRequestPointerLock ||
					canvas.mozRequestPointerLock ||
					canvas.webkitRequestPointerLock;
				if (canvas.requestPointerLock) {
					canvas.requestPointerLock();
				}
			}

			//continue with shooting requests or whatever :P
			//evt === 1 (mouse wheel click (not scrolling))
			//evt === 2 (right mouse click)
		};

		// Event listener when the pointerlock is updated (or removed by pressing ESC for example).
		const pointerlockchange = function () {
			const controlEnabled =
				(document as any).mozPointerLockElement ||
				(document as any).webkitPointerLockElement ||
				(document as any).msPointerLockElement ||
				document.pointerLockElement ||
				null;

			// If the user is already locked
			if (!controlEnabled) {
				//camera.detachControl(canvas);
				isLocked = false;
			} else {
				//camera.attachControl(canvas);
				isLocked = true;
			}
		};

		// Attach events to the document
		document.addEventListener('pointerlockchange', pointerlockchange, false);
		document.addEventListener('mspointerlockchange', pointerlockchange, false);
		document.addEventListener('mozpointerlockchange', pointerlockchange, false);
		document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

		//Geometry
		//Material
		const myMaterial = new StandardMaterial('myMaterial', scene);
		myMaterial.diffuseColor = new Color3(0, 0, 1);
		myMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
		myMaterial.emissiveColor = new Color3(1, 0, 0);
		myMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);

		//Ground
		const myGround = MeshBuilder.CreateGround(
			'myGround',
			{ width: 200, height: 200, subdivisions: 4 },
			scene
		);
		// const groundMaterial = new StandardMaterial('ground', scene);
		myGround.position.y = -1;
		myGround.checkCollisions = true;
		// myGround.physicsImpostor = new PhysicsImpostor(
		// 	myGround,
		// 	PhysicsImpostor.BoxImpostor,
		// 	{
		// 		mass: 0,
		// 		restitution: 0.5,
		// 		friction: 0.1,
		// 	},
		// 	scene
		// );

		//Sphere
		const ball = Mesh.CreateSphere('ball', 30, 2, scene);
		ball.material = myMaterial;
		ball.isPickable = true;

		ball.position.x = camera.position.x;
		ball.position.y = camera.position.y;
		ball.position.z = camera.position.z;

		// Spheres
		// 	let y = 200;
		// 	for (let index = 0; index < 50; index++) {
		// 		let sphere = Mesh.CreateSphere("Sphere0", 16, 3, scene);
		// 		sphere.material = myMaterial;
		//
		// 		sphere.position = new Vector3(Math.random() * 20 - 10, y, Math.random() * 10 - 5);
		//
		// 		sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);
		//
		// 		sphere.checkCollisions = true;
		//
		// 		y += 2;
		// 	}
		//
		//
		// 	//Sphere Physics
		// 	sphere.checkCollisions = true;
		// 	sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, { mass: 10, restitution: 0.7 }, scene);
		// 	sphere.physicsImpostor.applyImpulse(new Vector3(10, 10, 10), sphere.getAbsolutePosition());
		//
		// 	sphere.physicsImpostor.registerOnPhysicsCollide(myGround.physicsImpostor, function(main, collided) {
		// 		main.object.material.diffuseColor = new Color3(Math.random(), Math.random(), Math.random());
		// 		main.object.material.specularColor = new Color3(Math.random(), Math.random(), Math.random());
		// 		main.object.material.ambientColor = new Color3(Math.random(), Math.random(), Math.random());
		// 	});

		//Sphere Interaction

		//Shoot
		// Radial explosion impulse/force
		/* let origins = [
			 new Vector3(-8, 6, 0),
			 new Vector3(0, 0, 0),
			 new Vector3(8, 2, 4),
			 new Vector3(-4, 0, -4),
		 ];
		 let radius = 8;
		 let strength = 20;

		 for (let i = 0; i < origins.length; i++) {
			 let origin = origins[i];

			 setTimeout(function (origin) {
				 let event = physicsHelper.applyRadialExplosionImpulse( // or .applyRadialExplosionForce
					 origin,
					 radius,
					 strength,
					 PhysicsRadialImpulseFalloff.Linear // or PhysicsRadialImpulseFalloff.Constant
				 );

				 // Debug
				 let eventData = event.getData();
				 let debugData = showExplosionDebug(eventData);
				 setTimeout(function (debugData) {
					 hideExplosionDebug(debugData);
					 event.dispose(); // we need to cleanup/dispose, after we don't use the data anymore
				 }, 1500, debugData);
				 // Debug - END
			 }, i * 2000 + 1000, origin);
		 }
		 */

		//Bounding box Geometry (Re-code this to update when the ground updates)

		const border0 = Mesh.CreateBox('border0', 1, scene);
		border0.scaling = new Vector3(5, 100, 200);
		border0.position.x = -100.0;
		border0.checkCollisions = true;
		border0.isVisible = false;

		const border1 = Mesh.CreateBox('border1', 1, scene);
		border1.scaling = new Vector3(5, 100, 200);
		border1.position.x = 100.0;
		border1.checkCollisions = true;
		border1.isVisible = false;

		const border2 = Mesh.CreateBox('border2', 1, scene);
		border2.scaling = new Vector3(200, 100, 5);
		border2.position.z = 100.0;
		border2.checkCollisions = true;
		border2.isVisible = false;

		const border3 = Mesh.CreateBox('border3', 1, scene);
		border3.scaling = new Vector3(200, 100, 5);
		border3.position.z = -100.0;
		border3.checkCollisions = true;
		border3.isVisible = false;

		// border0.physicsImpostor = new PhysicsImpostor(
		// 	border0,
		// 	PhysicsImpostor.BoxImpostor,
		// 	{ mass: 0 },
		// 	scene
		// );
		// border1.physicsImpostor = new PhysicsImpostor(
		// 	border1,
		// 	PhysicsImpostor.BoxImpostor,
		// 	{ mass: 0 },
		// 	scene
		// );
		// border2.physicsImpostor = new PhysicsImpostor(
		// 	border2,
		// 	PhysicsImpostor.BoxImpostor,
		// 	{ mass: 0 },
		// 	scene
		// );
		// border3.physicsImpostor = new PhysicsImpostor(
		// 	border3,
		// 	PhysicsImpostor.BoxImpostor,
		// 	{ mass: 0 },
		// 	scene
		// );

		//Atmosphere

		//Light
		const light1 = new HemisphericLight('light1', new Vector3(1, 1, 0), scene);
		const light2 = new PointLight('light2', new Vector3(60, 60, 0), scene);
		const gl = new GlowLayer('sphere', scene);
		light1.intensity = 0.5;
		light2.intensity = 0.5;

		//Ball punch
		window.addEventListener('click', function () {
			const pickResult = scene.pick(scene.pointerX, scene.pointerY);

			if (
				pickResult?.hit &&
				pickResult?.pickedPoint &&
				pickResult?.pickedMesh &&
				scene.activeCamera
			) {
				const dir = pickResult.pickedPoint.subtract(scene.activeCamera.position);
				dir.normalize();
				pickResult.pickedMesh.applyImpulse(dir.scale(150), pickResult.pickedPoint);
			}
		});
	};

	useEffect(() => {
		const { current: canvas } = reactCanvas;

		if (!canvas) {
			return;
		}

		const engine = new Engine(canvas, true, undefined, false);

		const scene = new Scene(engine, undefined);
		scene.ambientColor = new Color3(1, 1, 1);
		scene.gravity = new Vector3(0, -0.75, 0);
		scene.collisionsEnabled = true;
		// window.CANNON = CANNON;
		// scene.enablePhysics();

		if (scene.isReady()) {
			onSceneReady(scene);
		} else {
			scene.onReadyObservable.addOnce((scene) => {
				onSceneReady(scene);
			});
		}

		engine.runRenderLoop(() => {
			if (typeof onRender === 'function') {
				onRender(scene);
			}
			scene.render();
		});

		const resize = () => {
			scene.getEngine().resize();
		};

		if (window) {
			window.addEventListener('resize', resize);
		}

		return () => {
			scene.getEngine().dispose();

			if (window) {
				window.removeEventListener('resize', resize);
			}
		};
	}, []);

	/**
	 * Will run on every frame render.  We are spinning the box on y-axis.
	 */
	const onRender = (scene: Scene) => {
		// let box: Mesh;
		// if (box !== undefined) {
		// 	let deltaTimeInMillis = scene.getEngine().getDeltaTime();
		//
		// 	const rpm = 10;
		// 	box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
		// }
	};

	return (
		<div>
			<canvas ref={reactCanvas} id="renderCanvas" width="100%" height="100%" />
		</div>
	);
}

export default App;
