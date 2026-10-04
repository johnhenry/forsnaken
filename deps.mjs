// domkit and pixelable, each pinned to a commit and loaded from jsDelivr's
// GitHub mirror (no build step, no npm). Change DOMKIT or PIXELABLE to move
// to another version.
const PIXELABLE = "https://cdn.jsdelivr.net/gh/johnhenry/pixelable@73c544ab05ccedc3089dfee81a105f8539d5f944/src";
const DOMKIT = "https://cdn.jsdelivr.net/gh/johnhenry/domkit@86b39db7a6d2807efed30a77cb295e72e6289c94/src";

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
