// ## 0. imports
// Main
import Game from './SnakeGame/game.mjs';
import combineRenderers from './combineRenderers.mjs';
import { canvas as CRF, element as ERF } from './SnakeGame/rendererFactories/index.mjs';

// Brains
import KeyBrain from './brains/human/keyboard.mjs';
import GamePadBrain from './brains/human/gamepad.mjs';
import SwipeBrain from './brains/human/swipe.mjs';
import RandomBrain from './brains/ai/random.mjs';
// Brain Configurations
import { wasd, antiWasd, arrows, antiArrows } from './brains/configurations/keyboard.mjs';
import { xbox, antiXbox } from './brains/configurations/gamepad.mjs';

// Utilities
import { loop as createAnimationLoop } from './createAnimationLoop.mjs';
import { EPILEPSY_WARNING } from './messages.mjs';


// ## Chapter 1: Canvas  
// The **canvas** is place in the HTML code where we will render our game.
// We've given it an id of "snake" and so that we can reference it in our code. 

const canvas = document.getElementById('snake');

// ## Chapter 2: Renderer Setup

// Render setup involves creating a **renderer** that will be used to render
// the output of the **gameInstance** object (created in the next chapter) on to the aforementioned **canvas**.

// Our **renderer** will actually be a combination of two renderers:
// one concrened with rendering the game to a canvas context; 
// another concerned with rendering effects on the HTML elemetn

// Before we create the **canvasRenderer**, we want to know the width and heigh
// of the object upon which we're drawing, **canvaswidth** and **canvasheight**, 
// respective. Note that we set these in the HTML as a practical measure to avoid flash, and are resetting them here for demonstration purposes.

const canvaswidth = canvas.width = 800;// already set in HTML to prevent flash
const canvasheight = canvas.height = 400;// already set in HTML to prevent flash

// Next we need to create a **zoom**.
// This is an integer how "zoomed-in" a game will be when used to draw a game on a canvas.
// In order to make the game fit into the drawable areas, both the
// **canvaswidth** and **canvasheight** are scaled down by this number when making
//  calculations within the game.
// For example, with a zoom of 1, 1 unit in the game would be drawn over a 1x1 (1) pixel square 
//              with a zoom of 8, 1 unit in the game would be drawn over a 8x8 (64) pixel square 
// We've picked 8, but as long as it's a divisor of both **canvaswidth** and **canvasheight**, it will work. 
const zoom = 8;

if(canvaswidth % zoom || canvasheight % zoom){
  throw new Error('zoom must be a divisor of canvas width and height');
}

// We create the **canvasRenderer**, by passing these properties,
// along the **canvas** from chapter 1 into the **rendererFactory**.

const canvasRenderer = CRF(canvas, canvaswidth, canvasheight, zoom);


// The element renderer will also render to the **canvas**
// Besause the element render needs a reference to the loop, (defined below)
// and the loop is crated with a reference to the element, we define it now,
// and pass it to the element via function call when once it's later defined.
let loop;
const elementRenderer = ERF(canvas, ()=>loop);
// Finally, we create the **renderer**, by the original two renderes ,

const renderer = combineRenderers(canvasRenderer, elementRenderer)

// ## Chapter 3: Game Setup

// Game setup involves creating a **gameInstance** whose output is rendered using the **renderer** from the previous chapter.

// Before creating the game, we scale down **canvaswidth** and **canvasheight** by a factor of **zoom** in order to make the game calculations match the renderer.
// We call these  **width** and **height** respectively.
const width = canvaswidth/zoom;
const height = canvasheight/zoom;

// The game calls for a specific quantity called **appleNumber** that representes the number of apples randomly distributed throught the game world. We've chosen an  calculation based on height and width to ensure that this number is around 1% of the total game area.
const appleNum = Math.ceil(0.01 * width * height);

// Each object in the **snakes** array represents the starting properties of a snake when spawned.
// Hopefully the named properties are self explanatory
// Snakes on a "teams" are given the same id as to signify their connection. 

// The main differentiator between each snake is the "brains" array
// Brains are an interface used to control entities from outside of the game.
// Brains in "./brains/ai/" are controlled by the computer itself.

// The *snakes* array represents a list of initialisations for each snake.
const snakes = [];
// Brains in the "./brains/human/" directory connect to human interface devices to allow for input.
// The first snake can be controlled by the arrow keys, the d-pad on a game controller,
// or via swiping on a touch screen. 
snakes[0] = {
  id: 'green',
  color: '#4e9a06',
  x: 0,
  y: 0, 
  velocity: +1,
  horizontal:true,
  brains: [
    new GamePadBrain(0, xbox),
    new KeyBrain(arrows),
    new SwipeBrain(30)
  ]
};
// The second snakes's movements mirrors the first's.
snakes[1] = {
  id: 'green',
  color: '#8ae232',
  x: 0,
  y: height - 2,
  velocity: -1,
  horizontal:false,
  brains: [
    new GamePadBrain(0, antiXbox),
    new KeyBrain(antiArrows),
    new SwipeBrain(30, ['down', 'up', 'right', 'left'])
  ]
};
// The third snake is controlled by either the "wasd" keys or the d-pad on a _second_ game controller.
snakes[2] = {
  id: 'yellow',
  color: '#c4a000',
  x: width - 1,
  y: 0,
  velocity: +1,
  horizontal:false,
  brains: [
    new GamePadBrain(1, xbox), 
    new KeyBrain(wasd)
  ]
};
// The fourth snakes's movements mirror the third's.
snakes[3] = {
  id: 'yellow',
  color: '#fce94f',
  x: width - 1,
  y: height - 2,
  velocity: -1,
  horizontal:true,
  brains: [
    new GamePadBrain(1, antiXbox),
    new KeyBrain(antiWasd)
  ]
};
// There is a fifth snake controlled by the computer. It turns clockwise, counterclockwise, or continues straight after every second.
snakes[4] = {
  id: 'white',
  color: '#ffffff',
  x: Math.floor(width/2),
  y: Math.ceil(height/2),
  velocity: Math.random() < 0.5 ? 1 : -1,
  horizontal: Math.random() < 0.5 ? true : false,
  brains: [
    new RandomBrain({ 'clockwise':1,'counterclockwise':1, '':2 })
  ]
};

// Finally, we create the **gameInstance**, by passing these properties into **Game**.
const gameInstance = Game({ appleNum, width, height }, ...snakes);

// ## Chapter 4: Run Game

// The objective of this sections is to run **createAnimationLoop**
// on the previously created *game* and *renderer* objects to start the game.

// We optionally set the **FPS** (Frames Per Second) of the loop as 12,
const FPS = 20;
if(120 % FPS || FPS > 60){
  throw new Error(`FPS must be a divisor of 120 and less than or equal to 60:
1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40, 60`);
}

// We pass the **gameInstance**, **renderer**, and **FPS** to **createAnimationLoop** to start the game running.
// We also passed an optional flag as "false" to prevent the loop from starting immediately.
loop = createAnimationLoop(
  gameInstance,
  renderer,
  FPS,
  false);

// **createAnimationLoop** returns an object **pause**, and **resume** methods to
// control the loop outside of the game.

// Because we haven't started the game, we can wait for the user to confirm the
// the message before not starting. The game simply does not start if the user
// rejects the dialog
if (confirm(EPILEPSY_WARNING)){
  loop.resume();
}
