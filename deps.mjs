// domkit and canvas-fx, each pinned to a commit and loaded from jsDelivr's
// GitHub mirror (no build step, no npm). Change DOMKIT or CANVAS_FX to move
// to another version.
const CANVAS_FX = "https://cdn.jsdelivr.net/gh/johnhenry/canvas-fx@af0b50414a9bdbfe9daaa26752d9792a3ee9712e/src";
const DOMKIT = "https://cdn.jsdelivr.net/gh/johnhenry/domkit@86b39db7a6d2807efed30a77cb295e72e6289c94/src";

await Promise.all(
  [
    "frame-timer/global.mjs", // the game's clock
    "hot-key/global.mjs", // keyboard steering
    "gamepad-input/global.mjs", // controller steering
    "swipe-input/global.mjs", // touch steering
  ].map((path) => import(`${DOMKIT}/${path}`)).concat(
    // the board, scaled up through pixel effects (@johnhenry/canvas-fx)
    import(`${CANVAS_FX}/pixel-canvas/global.mjs`),
  ),
);
