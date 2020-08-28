const getName = (obj) => {
  const funcNameRegex = /function (.{1,})\(/;
  const results = (funcNameRegex).exec((obj).constructor.toString());
  return (results && results.length > 1) ? results[1] : "";
};

// Detect if the browser is Edge
const  isEDGE = () => /Edge\/\d./i.test(navigator.userAgent);

var slice = Function.call.bind(Array.prototype.slice);

var isCssMediaRule = function(cssRule) {
    if(isEDGE()) {
        return getName(cssRule) === 'CSSMediaRule';
    }
    return cssRule.type === cssRule.MEDIA_RULE;
}

var isCssStyleRule = function(cssRule) {
    if(isEDGE()) {
        return getName(cssRule)  === 'CSSStyleRule';
    }
    return cssRule.type === cssRule.STYLE_RULE;
}

// Here we get the cssRules across all the stylesheets in one array
export default (document=window.document)=>{
  var cssRules = slice(document.styleSheets).reduce(function (rules, styleSheet) {
      return rules.concat(slice(styleSheet.cssRules));
  }, []);

  const mediaRules = cssRules.filter(isCssMediaRule);

  return cssRules.filter(isCssStyleRule).concat(slice(mediaRules).reduce(function (rules, mediaRule) {
      return rules.concat(slice(mediaRule.cssRules));
  }, []));
}


