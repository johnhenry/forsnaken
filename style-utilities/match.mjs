import rules from './rules.mjs';
var isElementMatchWithCssRule = function (element, cssRule){
  var proto = Element.prototype;
  var matches = Function.call.bind(proto.matchesSelector ||
      proto.mozMatchesSelector || proto.webkitMatchesSelector ||
      proto.msMatchesSelector || proto.oMatchesSelector);
  return matches(element, cssRule.selectorText);
};

export default function (elm, document=window.document) {
  return new Set(rules(document).filter(isElementMatchWithCssRule.bind(null, elm)).map(({selectorText})=>selectorText));
};