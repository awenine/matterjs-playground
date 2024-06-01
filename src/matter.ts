import {
	Engine,
	Bodies,
	Render,
	Composite,
	Runner,
	Constraint,
	MouseConstraint,
	Mouse,
	Body,
	Vector,
	Events,
	Sleeping,
	Svg,
	Common,
} from "matter-js";

import { decomp } from "poly-decomp-es";

import typescriptLogo from "./typescript.svg";
import testShape from "../public/testShape.svg";

import chrisMusicPng from "/chris-music.png";

// Common.setDecomp(decomp)

// create a basic sound player settup

const audioCtx = new AudioContext();

const soundNumbers = [4, 6, 9, 12, 15];

const sounds = soundNumbers.map((number) => {
	let sound = new Audio();
	sound.src = `/sounds/sound_${number}.WAV`;
	return sound;
});

// create dom element for logging

const textBox = document.getElementById("textBox");

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `

<img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />

`;

// create an engine
const engine = Engine.create();

// create a renderer
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: false,
	},
});

// create two boxes and a ground
const boxA = Bodies.rectangle(400, 200, 80, 80, {
	restitution: 0.7,
	render: {
		sprite: {
			texture: chrisMusicPng,
			xScale: 80 / 512,
			yScale: 80 / 512,
		},
	},
});

const litterBoxes = [350, 450, 550].map((x) => {
	return Bodies.rectangle(x, 100, 80, 80, {
		restitution: 0.7,
	});
});
// const boxB = Bodies.rectangle(450, 50, 80, 80);
// const otherBody = Bodies.circle(400,300,50, {isStatic:true})
const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
const rightWall = Bodies.rectangle(30, 300, 60, 600, { isStatic: true });
const leftWall = Bodies.rectangle(790, 300, 60, 600, { isStatic: true });

// console.log("boxA: ",boxA);

// Svg Code

let tsSvg;

var select = function (root, selector) {
	// turns the resulting nodelist into an Array
	return Array.prototype.slice.call(root.querySelectorAll(selector));
};

var loadSvg = function (url) {
	return fetch(url)
		.then(function (response) {
			return response.text();
		})
		.then(function (raw) {
			return new window.DOMParser().parseFromString(raw, "image/svg+xml");
		});
};

loadSvg(testShape).then(function (root) {
	console.log("root: ", root);
	var color = Common.choose([
		"#f19648",
		"#f5d259",
		"#f55a3c",
		"#063e7b",
		"#ececd1",
	]);

	console.log(Array.prototype.slice.call(root.querySelectorAll("path")));

	var vertexSets = select(root, "path").map(function (path) {
		return Svg.pathToVertices(path, 30);
	});

	tsSvg = Bodies.fromVertices(
		400,
		80,
		vertexSets,
		{
			render: {
				fillStyle: color,
				strokeStyle: color,
				lineWidth: 1,
			},
		},
		true
	);

	console.log("tsSvg: ", tsSvg);

	Composite.add(engine.world, tsSvg);

	// Composite.add(engine.world, Bodies.fromVertices(400, 80, vertexSets, {
	//     render: {
	//         fillStyle: color,
	//         strokeStyle: color,
	//         lineWidth: 1
	//     }
	// }, true));
});

//Chain

const chainLinks = [];
const chainConstraints = [];
for (let i = 0; i < 12; i++) {
	chainLinks.push(Bodies.circle((i + 1) * 50 + 30, 50, 20));
	if (i > 0) {
		chainConstraints.push(
			Constraint.create({
				bodyA: chainLinks[i - 1],
				bodyB: chainLinks[i],
				stiffness: 0.4,
				render: {
					visible: false,
				},
			})
		);
	}
}

// pin the first chain link in place
chainLinks[0].isStatic = true;

const matterMouse = Mouse.create(document.body);

const mouseConstraint = MouseConstraint.create(engine, {
	mouse: matterMouse,
});

let flippedColour = "#ff0000";

// Events.on(mouseConstraint, 'startdrag', function(event) {
//   console.log('startdrag', event);
//   flippedColour = event.body.render.fillStyle
//   event.body.render.fillStyle = '#ff0000'
//   event.body.circleRadius = 30

// });

let pairCounter = 0;

Events.on(engine, "collisionStart", function (event) {
	console.log("collision event", event);

	const { pairs } = event;
	console.log("length", pairs[0]);

	for (var i = 0; i < pairs.length; i++) {
		var pair = pairs[i];
		pair.bodyA.render.fillStyle = "#333";
		pair.bodyB.render.fillStyle = "#333";
	}

	if (pairs[0].bodyA.id === 1) {
		sounds[1].play();
	}
});
// Events.on(engine, 'collisionEnd', function(event) {
//   console.log('pairs (end)', event);
//   var pairs = event.pairs;

//   // change object colours to show those in an active collision (e.g. resting contact)
//   for (var i = 0; i < pairs.length; i++) {
//       var pair = pairs[i];
//       pair.bodyA.render.fillStyle = '#333';
//       pair.bodyB.render.fillStyle = '#333';
//   }
// })

setTimeout(() => {
	Body.setVelocity(boxA, Vector.create(0, -7));
	console.log("FIRE");
}, 6000);

// move body code - from https://github.com/liabru/matter-js/issues/733

//? NOTE - as this method doesnt use velocity, it doesnt move other object out of the way naturally - how to adapt?
function forceMoveAndRotate(
	body: Body,
	endX: number,
	endY: number,
	pct: number
) {
	// dx is the total distance to move in the X direction
	let dx = endX - body.position.x;

	// dy is the total distance to move in the Y direction
	let dy = endY - body.position.y;

	// use dx & dy to calculate where the current [x,y] is at a given pct
	let x = body.position.x + (dx * pct) / 100;
	let y = body.position.y + (dy * pct) / 100;
	let r = (body.angle / 100) * (100 - pct);

	Body.setPosition(body, {
		x: x,
		y: y,
	});

	// Body.setVelocity(body)

	Body.setAngle(body, r);
}

let movePercent = 0;
const targetX = 400;
const targetY = 300;

let move = false;
let movableBody = boxA;
let moveVector = Vector.create(0, 0);

Events.on(mouseConstraint, "enddrag", function (event) {
	console.log("enddrag", event.body);
	// event.body.render.fillStyle = flippedColour
	// Body.setVelocity(event.body, Vector.create(0,-7))
	// event.body.circleRadius = 20
	// if (event.body.id = 1) {
	console.log("boxA dragged");

	if (!event.body.isStatic) {
		Sleeping.set(movableBody, false);
		movePercent = 0;
		movableBody = event.body;
		move = true;
		if (textBox) textBox.innerHTML = `body id: ${event.body.id}`;
	}
});

Events.on(engine, "beforeUpdate", function (_event) {
	if (move) {
		if (movePercent < 101) {
			movePercent = movePercent + 1;
			forceMoveAndRotate(movableBody, targetX, targetY, movePercent);
		} else {
			// set angle to upright
			movableBody.angle = 0;
			Sleeping.set(movableBody, true);
			move = false;
		}
	}
});

// add all of the bodies to the world
Composite.add(engine.world, [
	ground,
	rightWall,
	leftWall,
	// ...chainLinks, ...chainConstraints,
	mouseConstraint,
	// boxA, ...litterBoxes
]);

// run the renderer
Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);

console.log("engine: ", engine);
