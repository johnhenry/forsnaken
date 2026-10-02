// `npm run manifest` -> custom-elements.json: every element's tag,
// attributes, and events, from the JSDoc in game/*.mjs, and (added by
// scripts/manifest.mjs) which module registers each tag. Editors and page
// builders read it; CI checks it's current.
export default {
  globs: ["game/elements.mjs", "game/brains.mjs"],
  outdir: ".",
};
