// domkit, pinned to a commit and loaded from jsDelivr's GitHub mirror (no
// build step, no npm). Change DOMKIT to move to another version.
const DOMKIT = "https://cdn.jsdelivr.net/gh/johnhenry/domkit@7652163205b366ad9560beb5787ce33ae2979413/src";

await Promise.all(
  [
    "frame-timer/global.mjs", // the game's clock
    "pixelable/pixel-canvas/global.mjs", // the board, scaled up through pixel effects
    "hot-key/global.mjs", // keyboard steering
    "gamepad-input/global.mjs", // controller steering
    "swipe-input/global.mjs", // touch steering
  ].map((path) => import(`${DOMKIT}/${path}`)),
);
