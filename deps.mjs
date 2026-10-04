// domkit and pixelable, each pinned to a commit and loaded from jsDelivr's
// GitHub mirror (no build step, no npm). Change DOMKIT or PIXELABLE to move
// to another version.
const PIXELABLE = "https://cdn.jsdelivr.net/gh/johnhenry/pixelable@869ee5f4af8f7bbfeb24ea481f2843835800f849/src";
const DOMKIT = "https://cdn.jsdelivr.net/gh/johnhenry/domkit@6b06f9ae97fde22c367107f0c3c8967ed79c889e/src";

await Promise.all(
  [
    "frame-timer/global.mjs", // the game's clock
    "hot-key/global.mjs", // keyboard steering
    "gamepad-input/global.mjs", // controller steering
    "swipe-input/global.mjs", // touch steering
  ].map((path) => import(`${DOMKIT}/${path}`)).concat(
    // the board, scaled up through pixel effects (@johnhenry/pixelable)
    import(`${PIXELABLE}/pixel-canvas/global.mjs`),
  ),
);
