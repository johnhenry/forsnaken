# 🐍 Forsnaken 🐍

This is a snake game that I'm using to help some friends/co-workers learn how to program computers. Many thanks to [@straker](https://www.patreon.com/join/straker) upon whose [original gist](https://gist.github.com/straker/ff00b4b49669ad3dec890306d348adc4) we've built.

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
- [http-server](https://www.npmjs.com/package/http-server) is also a good choice, but it requires that one manually reload the page after making updates. This has the advantage of allowing one to see request made on the command line.

## Gameplay Features

Forsnaken is a variation of the classic game [snake](https://www.youtube.com/watch?v=Z18vpf0kODo),
where the goal is to eat apples without running into yourself or other snakes.
The more apples you eat, the longer you grow.

### Local Multiplayer:

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

## Application Story

This application's main entry point, [./index.mjs](./index.mjs) is split into "chapters" that will allow us to look at its "story" and understand its structure.

## Application Architecture

I have some loose notes on this applicaton's arcitecture and architecture in general [here](./architecture.md).

## Further Exploration

- Network Multiplayer:

  - may be achieved through creating a "brain" the comminicates via WebRTC, web sockets, or some other realtime API
  - OR by modifying the renderer to sync state over above APIs

- Framing:

  - wrap the main game in html that includes instructions, scores, etc.
  - Perhaps add other states that display menu or tell story.
  - More readable Epilepsy warning.

- Give similar treatment to [@straker](https://gist.github.com/straker)'s other public projects:

  - [Pong](https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5)
  - [Breakout](https://gist.github.com/straker/98a2aed6a7686d26c04810f08bfaf66b)
  - [Tetris](https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1)
  - [Bomberman](https://gist.github.com/straker/769fb461e066147ea16ac2cb9463beae)

- Give similar treatment to [@Pro496951](https://gist.github.com/Pro496951)'s version of [Flappy Birds](https://gist.github.com/Pro496951/a7537d2f313fbc6ebad1f74b83f84244)

- Currently, the number of number of snakes and the way they are controlled is set at instantiation of the game. While we can update the "snakes" array in [./index.mjs](./index.mjs), how might we add and remove players at run time? Maybe just without refreshing the page?

- Apples currently have a set value of 2. What might we change to make apples variable?

  - How might we represent this? Size? Color? Opacity?

- Are there other effect we can add using JQuery UI? that would enhance the game?

- Create different rendering engines that render to HTML, SVG, the console, or some other medium.

- Replace game loop with one compiled to wasm while using same rendering engine.

- Add Sound

- Add ability to train AI with tensorflow.js
