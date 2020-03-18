# Basic Snake HTML Game

Initial Source: https://gist.github.com/straker/ff00b4b49669ad3dec890306d348adc4#file-snake-html

Snake is a fun game to make as it doesn't require a lot of code (less than 100 lines with all comments removed). This is a basic implementation of the snake game, but it's missing a few things intentionally and they're left as further exploration for the reader.

## Further Exploration

- Score
  - When the snake eats an apple, the score should increase by one. Use [context.fillText()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText) to display the score to the screen
- Mobile and touchscreen support
  - Allow the game to be scalled down to a phone size. See https://codepen.io/straker/pen/VazMaL
  - Support [touch controls](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- Better apple spawning
  - Currently the apple spawns in any random grid in the game, even if the snake is already on that spot. Improve it so it only spanws in empty grid locations
  
## License

(CC0 1.0 Universal) You're free to use this game and code in any project, personal or commercial. There's no need to ask permission before using these. Giving attribution is not required, but appreciated.

## Other Basic Games

- [Pong](https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5)
- [Breakout](https://gist.github.com/straker/98a2aed6a7686d26c04810f08bfaf66b)
- [Tetris](https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1)
- [Bomberman](https://gist.github.com/straker/769fb461e066147ea16ac2cb9463beae)

## Support

Basic HTML Games are made possible by users like you. When you become a [Patron](https://www.patreon.com/straker), you get access to behind the scenes development logs, the ability to vote on which games I work on next, and early access to the next Basic HTML Game.