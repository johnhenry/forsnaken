import Menu from "./menu.component.mjs";
import BrainKeyboard from "./brains/human/keyboard.component.mjs";
import BrainGamepad from "./brains/human/gamepad.component.mjs";
import BrainSwipe from "./brains/human/swipe.component.mjs";
import BrainRandom from "./brains/ai/random.component.mjs";
import InternalTimer from "./internal-timer.component.mjs";
import EventConsumer from "./event-consumer/index.component.mjs";
import CanvasRenderer from "./canvasrenderer/index.component.mjs";
import ZoomShader from "./pixelshaders/zoom-shader.component.mjs";
import GridShader from "./pixelshaders/grid-shader.component.mjs";

import SnakeGame from "./SnakeGame/index.component.mjs";
import SnakeObjects from "./SnakeGame/objects/index.component.mjs";
import SnakeComponentSnake from "./SnakeGame/entities/Snake.component.mjs";
import SnakeComponentApple from "./SnakeGame/entities/Apple.component.mjs";
import SnakeComponentWall from "./SnakeGame/entities/Wall.component.mjs";

for (const [tagName, className] of [
  ["stack-menu", Menu],
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
]) {
  customElements.define(tagName, className);
}
