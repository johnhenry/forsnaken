export default (newNode, referenceNode) => referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
