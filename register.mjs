import BrainKeyboard from "https://johnhenry.github.io/std/js/brains@0.0.0/human/keyboard.component.mjs";
import BrainGamepad from "https://johnhenry.github.io/std/js/brains@0.0.0/human/gamepad.component.mjs";
import BrainSwipe from "https://johnhenry.github.io/std/js/brains@0.0.0/human/swipe.component.mjs";
import BrainRandom from "https://johnhenry.github.io/std/js/brains@0.0.0/ai/random.component.mjs";
import InternalTimer from "https://johnhenry.github.io/std/js/internal-timer.component@0.0.0/index.mjs";
import EventConsumer from "https://johnhenry.github.io/std/js/event-consumer.component@0.0.0/index.mjs";
import CanvasRenderer from "https://johnhenry.github.io/std/js/canvasrenderer.component@0.0.0/index.mjs";
import {
  zoom as ZoomShader,
  grid as GridShader,
} from "https://johnhenry.github.io/std/js/pixelshader.component@0.0.0/index.mjs";
import ImageDataEmitter from "https://johnhenry.github.io/std/js/imagedata-emitter.component@0.0.0/index.mjs";

import SnakeGame from "./SnakeGame/index.component.mjs";
import SnakeObjects from "./SnakeGame/objects/index.component.mjs";
import SnakeComponentSnake from "./SnakeGame/entities/snake.component.mjs";
import SnakeComponentApple from "./SnakeGame/entities/apple.component.mjs";
import SnakeComponentWall from "./SnakeGame/entities/wall.component.mjs";

for (const [tagName, className] of [
  ["brain-keyboard", BrainKeyboard],
  ["brain-gamepad", BrainGamepad],
  ["brain-random", BrainRandom],
  ["brain-swipe", BrainSwipe],
  ["internal-timer", InternalTimer],
  ["event-consumer", EventConsumer],
  ["canvas-renderer", CanvasRenderer],
  ["shader-grid", GridShader],
  ["shader-zoom", ZoomShader],
  ["snake-objects", SnakeObjects],
  ["forsnaken-game", SnakeGame],
  ["forsnaken-snake", SnakeComponentSnake],
  ["forsnaken-apple", SnakeComponentApple],
  ["forsnaken-wall", SnakeComponentWall],
  ["imagedata-emitter", ImageDataEmitter],
]) {
  customElements.define(tagName, className);
}
