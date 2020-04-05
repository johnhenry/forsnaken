# 🐍 Forsnaken 🐍

This is a [snake game](https://www.youtube.com/watch?v=Z18vpf0kODo) that I'm using to help some friends/co-workers learn how to program computers. Many thanks to [@straker](https://www.patreon.com/join/straker) upon whose [original gist](https://gist.github.com/straker/ff00b4b49669ad3dec890306d348adc4) we've built.

Note: Due to the use of [private class fields](https://caniuse.com/#feat=mdn-javascript_classes_private_class_fields),
this currently works only on chromium-based browsers, e.g. Chrome for Desktop, Chrome for Android, Edge.

## Deployments

You can find a copy of this application deployed here:

### [netlify.com](https://forsnaken.netlify.com) 
  
[![Netlify Status](https://api.netlify.com/api/v1/badges/55f3fc2c-7517-4398-aa65-fa9272827241/deploy-status)](https://app.netlify.com/sites/forsnaken/deploys)
### [fleek.co](https://shrill-queen-7996.on.fleek.co/)

## Local Deployment

1. Clone this repository.
2. Use a static http server to serve the repository directory.
- [live-server](https://www.npmjs.com/package/live-server) is a good choice for development as it will reload the page upon changes to the directory.
- [http-server](https://www.npmjs.com/package/http-server) is also a good choice, but it requires that one manually reload the page after making updates.

## Gameplay Features

Forsnaken is a variation of the classic game snake.

Goals: eat apples without running into yourself or other snakes. The more apples you eat, the longer you grow.

### Multiplayer Controls:
 - Snake 1 controls: arrows, a gamepad, or swipe screen with finger or mouse
 - Snake 2 controls: "WASD" or a second gamepad
 - Snakes 3 & 4 control with mirrored versions of Snake 1 and 2 control respectively
 - Snakes 5 moves randomly

### Camouflage

 Game background changes to color of snake that most recently scored -- making it invisible!
 Amateurs hate this.
 Experts use it to their advantage.

### Shaking

  "This game shakes!"

### Epilepsy Warning

  ... because of the aforementioned color changes and shaking.

## Application Story

Generally, I encourage developers to put imports at the top of a file. This is especially true when developing modules.

In the case of top-level applications and demos, however; I like to tell a sort of "story" with my code and thus import objects wher

This application's main entry point, [./index.mjs](./index.mjs) is split into chapters that will allow us to look at its story and understand its structure.

Most of the rest of the files are being modules that contribute to the top-level application. As such, they follow a traditional structure and are annotated with traditional comments. 

Without further adieu...

### Chapter 1: Canvas
  
  The **canvas** is place in the HTML code where we will render our game. We've given it an id of "snake" and so that we can reference it in our code. 

### Chapter 2: Renderer Setup

  Render setup involves creating a **renderer** that will be used to render the output of the **game** object (created in the next chapter) on to the aforementioned **canvas**.

  Before we create the **renderer**, we want to know the width and height of the object upon which we're drawing, **canvaswidth** and **canvasheight**, respective. Note that we set these in the HTML as a practical measure to avoid flash, and are resetting them here for demonstration purposes.

  Next we need to create a **zoom**. This is an integer how "zoomed" in a game will be when used to draw a game on a canvas. In order to make the game fit into the drawable areas, both the **canvaswidth** and **canvasheight** are scaled down by this number when making calculations within the game. We've picked 8, but as long as it's a divisor of both **canvaswidth** and **canvasheight**, it will work. 

  Finally, we create the **renderer**, by passing these properties, along the **canvas** from chapter 1 into the **rendererFactory**.

### Chapter 3: Game Setup

  Game setup involves creating a **game** whose output is rendered using the **renderer** from the previous chapter.

  Before creating the game, we scale down **canvaswidth** and **canvasheight** by a factor of **zoom** in order to make the game calculations match the renderer.
  We call these  **width** and **height** respectively.

  The game calls for a specific quantity called **appleNumber** that representes the number of apples randomly distributed throught the game world. We've chosen an  calculation based on height and width to ensure that this number is around 1% of the total game area.

  Brains are an interface used to control entities from outside of the game. Brains in the "./brains/human/" directory connect to human interface devices to allow for input, while brains in "./brains/ai/" are controlled by the computer itself.

  Each object in the **snakes** array represents the starting properties of a snake when spawned. Snakes on a "teams" are given the same id as to signify their connection. 
  
  The first player can be controlled by either the arrow keys, the d-pad on a game controller or via swiping on a touch screen and the second player follows these same controller, but mirrored. 

  Similarly, the third player can be controlled by either the "wasd" keys or the d-pad on a _second_ game controller and the fourth player's movements will be mirrored.

  There is a fifth snake controlled by the computer. It turns clockwise, counterclockwise, or continues straight after every second.

  Finally, we create the **game**, by passing these properties into **SnakeGame**.

### Chapter 4: Run Game

  We use a utility **createAnimationLoop** that builds atop the browser's native *requestAnimationFrame* to run games at a specified framerate.

  After (somewhat arbitrarily) choosing **FPS** as 12,
  we pass the **game** and **renderer** to **createAnimationLoop** to start the game running.

  In additon, we use **running**, **pause**, and **resume** to show warning messages and controll the gameloop itself, but that's not terribly important.

## Further Exploration

Give similar treatment to [@straker](https://gist.github.com/straker)'s other projects:

- [Pong](https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5)
- [Breakout](https://gist.github.com/straker/98a2aed6a7686d26c04810f08bfaf66b)
- [Tetris](https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1)
- [Bomberman](https://gist.github.com/straker/769fb461e066147ea16ac2cb9463beae)

As well as [@Pro496951](https://gist.github.com/Pro496951)'s version of [Flappy Birds](https://gist.github.com/Pro496951/a7537d2f313fbc6ebad1f74b83f84244)
