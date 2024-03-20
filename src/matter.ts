import { Engine, Bodies, Render, Composite, Runner, Constraint, MouseConstraint, Mouse, Body, Vector, Events } from 'matter-js';

import chrisMusicPng from '/chris-music.png'

// create a basic sound player settup

const audioCtx = new AudioContext();

const soundNumbers = [4,6,9,12,15]

const sounds = soundNumbers.map(number => {
  let sound = new Audio();
  sound.src = `../public/sounds/sound_${number}.WAV`
  return sound
})




// create an engine
const engine = Engine.create();


// create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,        
    options: {
      wireframes: false
  }
});

// create two boxes and a ground
const boxA = Bodies.rectangle(400, 200, 80, 80,
  {
    restitution:0.7,
    render:{
      sprite:{
        texture:chrisMusicPng,
        xScale:80/512,
        yScale:80/512
      }
    }
  } 
);
// const boxB = Bodies.rectangle(450, 50, 80, 80);
const otherBody = Bodies.circle(400,300,50, {isStatic:true})
const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });




// console.log("boxA: ",boxA);


const chainLinks = []
const chainConstraints = []
for (let i = 0; i < 12; i++) {
  chainLinks.push(Bodies.circle(((i+1)*50)+30,50,20))
  if (i>0 ){
chainConstraints.push(Constraint.create({
  bodyA: chainLinks[i-1],
  bodyB: chainLinks[i],
  stiffness:0.4,
    render:{
    visible: false
  }
}))
  }
  
}

// pin the first chain link in place
chainLinks[0].isStatic = true

const matterMouse = Mouse.create(document.body)

const mouseConstraint = MouseConstraint.create(engine,{
  mouse: matterMouse
})

let flippedColour = '#ff0000'

// Events.on(mouseConstraint, 'startdrag', function(event) {
//   console.log('startdrag', event);
//   flippedColour = event.body.render.fillStyle
//   event.body.render.fillStyle = '#ff0000'
//   event.body.circleRadius = 30

// });

// Events.on(mouseConstraint, 'enddrag', function(event) {
//   console.log('enddrag', event.body);
//   event.body.render.fillStyle = flippedColour
//   Body.setVelocity(event.body, Vector.create(0,-7))
//   event.body.circleRadius = 20
// });

let pairCounter = 0  

Events.on(engine, 'collisionStart', function(event) {
  console.log('collision event', event);

  const {pairs} = event
  console.log('length',pairs[0]);
  
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    pair.bodyA.render.fillStyle = '#333';
    pair.bodyB.render.fillStyle = '#333';
  }

  if (pairs[0].bodyA.id === 1) {
    sounds[1].play()
  }

})
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
  Body.setVelocity(boxA, Vector.create(0,-7))
  console.log('FIRE');
},6000)




// add all of the bodies to the world
Composite.add(engine.world, [ ground, ...chainLinks, ...chainConstraints, otherBody, mouseConstraint, boxA, ]);

// run the renderer
Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);

console.log("engine: ",engine);



