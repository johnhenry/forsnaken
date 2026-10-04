// domkit and canvas-fx, each pinned to a commit and loaded from jsDelivr's
// GitHub mirror (no build step, no npm). Change DOMKIT or CANVAS_FX to move
// to another version.
const CANVAS_FX = "https://cdn.jsdelivr.net/gh/johnhenry/canvas-fx@6813d7555865f4bf2da2d3928f544f4e33463baf/src";
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
