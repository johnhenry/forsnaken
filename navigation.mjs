// Connect Menu (top-level) to Hash navigation
const menu = document.getElementById("menu");
menu.addEventListener("pushed", ({ detail:{ pushed}, path:[initiator]}) => {
  if(menu === initiator){
    window.location.hash = pushed;
  }
});
menu.addEventListener("popped", ({ path:[initiator]} ) => {
  if(menu === initiator){
    window.location.hash = "";
  }
});
const setHash = (
  { oldURL, newURL } = { oldURL: undefined, newURL: undefined }
) => {
  if (oldURL === newURL) {
    return;
  }
  menu.push((window.location.hash || "").split("#")[1] || null);
};
window.onhashchange = setHash;
menu.addEventListener(
  "reset",
  () => setHash({ newURL: window.location.hash }),
  { once: true }
);