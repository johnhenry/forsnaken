import stringifyAttributes from "./stringify-attributes.mjs";


export const generateImportStatements = (registeredComponents) => {
  const import_statments = [];
  let count = 0;
  for (const [, {tag, definition}] of Object.entries(registeredComponents)) {
    if (!definition) {
      continue;
    }
    import_statments.push(
      `      import Instantiator_${count} from "${definition}";` +
        "\n" +
        `      customElements.define(${tag}, Instantiator_${count++});` +
        "\n"
    );
  }
  return import_statments.join("");
}

export const generateFull = (baseHTML, style, importStatements) =>`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Exported</title>
<script type='module'>
${importStatements}
</script>
<style>
${style}
</style>
</head>
<body>
${baseHTML}
</body></html>`;

export const generateBackup = (components, styles, inputs) =>`<html>
<template id="components">
${components}
</template>
<template id="styles">
${styles}
</template>
<body>
${inputs}
</body>
<style>
body {
  height: 100%;
  color: rgba(100, 100, 100, 1);
  background-color:rgba(238, 238, 238, 1);
}

#inputs:empty::before{
  content: "Drag components here";
  text-align: center;
}
#inputs,
#inputs div {
  display: inline-flex;
  flex-direction: column;
  padding: 8px;
  padding-left: 16px;
  justify-content: space-around;
  color: rgba(100, 100, 100, 1);
  background-color:rgba(238, 238, 238, 0.75);
}
#inputs div {
  border-radius:5px;
  margin: 8px;
  box-shadow: 
    rgba(238, 238, 238, 1) 4px 4px 8px,
    rgba(170, 170, 170, 1) 4px 4px 8px;
}

#inputs div:empty {
  display: inline;
}

#inputs div::before {
  content: "<" attr(data-content-before-tag) ">" attr(data-content-before);
}
#inputs div::after{
  content: attr(data-content-after) "</" attr(data-tag) " >"; 
}
</style>
</html>`;

export const generateBackupHTML = (inputs, top=0)=>{
  return inputs.outerHTML;
  // const kids = [];
  // for(const input of inputs.children){
  //   kids.push(generateBackupHTML(input, top+1));
  // }
  // if(!top){
  //   return kids.join('\n');
  // } else {
  //   const contentBeforeRendered = (`<${inputs.dataset.tag}[${inputs.dataset.component_id}:${inputs.dataset.id}] ${stringifyAttributes(JSON.parse(inputs.dataset.attributes))}>${inputs.dataset.contentBefore || ""}`);
  //   const contentAfterRendered = (`${inputs.dataset.contentAfter || ""}</${inputs.dataset.tag}>`);
  //   return `<div data-id="${inputs.id.split('_')[1]}" data-tag="${inputs.dataset.tag}" data-component_id="${inputs.dataset.component_id}" data-attributes="${JSON.stringify(inputs.dataset.attributes)}" data-content-before="${inputs.dataset.contentBefore || ''}" data-content-after="${inputs.dataset.contentAfter || ''}" data-content-before-rendered="${contentBeforeRendered}" data-content-after-rendered="${contentAfterRendered}">${kids.join('\n')}</div>`;
  // }
}
