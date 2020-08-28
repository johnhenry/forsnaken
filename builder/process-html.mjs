//https://stackoverflow.com/a/26361620
//https://stackoverflow.com/questions/26360414/javascript-how-to-correct-indentation-in-html-string
const format = (node, level) => {
  const indentBefore = new Array(level++ + 1).join("  ");
  const indentAfter = new Array(level - 1).join("  ");
  let textNode;

  for (let i = 0; i < node.children.length; i++) {
    textNode = document.createTextNode("\n" + indentBefore);
    node.insertBefore(textNode, node.children[i]);

    format(node.children[i], level);

    if (node.lastElementChild == node.children[i]) {
      textNode = document.createTextNode("\n" + indentAfter);
      node.appendChild(textNode);
    }
  }
  return node;
};
export default (str) => {
  const div = document.createElement("div");
  div.innerHTML = str.trim();
  return format(div, 0).innerHTML;
};