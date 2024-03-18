import { Engine, Bodies, Render, Composite, Runner } from 'matter-js';

// create an engine
const engine = Engine.create();


// create a renderer
const render = Render.create({
    element: document.body,
    engine: engine
});

// create two boxes and a ground
const boxA = Bodies.rectangle(400, 200, 80, 80);
const boxB = Bodies.rectangle(450, 50, 80, 80);
const otherBody = Bodies.circle(500,300,70)
const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });




// add all of the bodies to the world
Composite.add(engine.world, [boxA, boxB,otherBody, ground]);

// run the renderer
Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);