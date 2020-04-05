# Game Architecture Notes

## Game Components

### events

The **game** and the **renderer** renderer are intimately connected in that **game** must output objects that the **renderer** "knows" how to render. 
In this game, we use a shared-event model to achieve this, but this could also be achieved in other ways including a type system.

Modules in the "/events/" folder should be shahared by both the **game** and the **renderer**,  but otherwise they should as decoupled from each other as possible.*

### entities

The two main types of entities in this game are "apples" and "snakes", thus we have modules representing them in the "entities" folder. If we wanted to add another type of object, say a "wall", we might add a class in "/entities/wall.mjs" to represent it.

Most games will have some type of entity that can be easily identified.
  
### collisions

Most real time games use some method of detecting of whether or not two objects collide. We've defined two modules **collide** and **collideArray** that detects whether two components or lists of components, respectively. 

## Game as iterator

  We use **createAnimationLoop** to run and render the game,
  but since the result of **SnakeGame** is an *iterator* and can be used as such.
  
  This might be useful for debugging, rendering outside of the browser,
  or usage withing other iterators.

  ```javascript
  const time = Math.floor(1000 / 60); // 1/60 of a second => 60 FPS
  for(const output of game) {
    await new Promise(resolve => setTimeout(resolve, time));
    renderer(output);
  }
  ```

  ```javascript
  const { value } = game.next();
  console.log(value);
  ```

  ```javascript
  const game = SnakeGame(/*...*/);
  switch(name){
    case 'snake': 
      yield * SnakeGame(/*...*/);
      break;
    default:
      yield * NoGame();
  }
  ```


## Side Effects

  One might consider the "main" purpose of this game loop to be to yield a "DrawEvent".
  In fact, removing the lines that yield events other than the "DrawEvent"
  would lead to a game that plays pretty much the same.

  Some actions -- such as changing the background color -- 
  could be done within the main rendering engine itself.
  The platform on which a game runs -- in this case the browser -- often makes primatives
  (or in the case of JQuery, extensions) to make implementing these actions
  more efficeintly.

  Other actions -- such as shaking the rendering surface -- 
  may be difficult or even impossible to do within the main rendering engine.

  Each game has unique considerations as to what to do with its gameloop and how to render it's output.
  A game may actually consist of a number fo types of sub-renderers within a renderers, as this does.
  A game may also have multiple game loops that work in conjunction with eachother to produce renderable output.

## Input Models

There are a few different ways of getting input into a game.

### Check State

In this model, a loop runs at a specific frequency and continually checks the state of values that may change.
The loop yields values based on this state to be rendered.

This is an efficient method and is used in most video games as well as on low-level development boards like arduino.

Be warned: in this model, frequency of the loop has a direct impact of the speed of the game.

### Event

In this model, a program listens for specific types of events and executes code based on their contents. 

Applications like this are easy to reason about but used in application where speed responsiveness is key.

I'm not sure, but I think that from a CS standpoint, this model is an abstraction atop the previous.

### Hybrids

In our game we use the "Check State" model within our main loop, but the "brains" that we use to send actions and change the direction the snakes move is based on the "Event" model. The "brains" emit signal events which tell the snake their orientaion.

To futher complicate this, the web gamepad API is based on the "Check State" model, and this must be tranlated into an "Event" model and back into the "Check State" model when using a game pad.

It might be considered efficent to just put the code for the gamepad API directly into event loop -- and that's how a lot of games, particulary consoles with limited input options work. The way that we've created this allows us to generalize how input works at the slight cost of efficiency within the gameloop.

