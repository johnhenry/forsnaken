// imports
import processHTML from "./process-html.mjs";
import stringifyAttributes from "./stringify-attributes.mjs";
import insertAfter from "./insert-after.mjs";
import merge from "./merge.mjs"
import { match, rules } from "../style-utilities/index.mjs";
// functional (should be imported)
const DEFAULT_URL = "./defaults.html"
const genId = (length = 5) => String(Math.random()).substr(2, length);
const allowDrop = (event) => event.preventDefault();
const dragComponent = (event) => {
  event.dataTransfer.setData("type", "component");
  event.dataTransfer.setData("id", event.target.dataset.id);
};
const dragInput = (event) => {
  event.dataTransfer.setData("type", "input");
  event.dataTransfer.setData("id", event.target.id);
};

const addAttribute = (form)=>()=>{
  const k = document.createElement("input");
  k.placeholder = "key";
  const v = document.createElement("input");
  v.placeholder = "value"
  form.append(k, v);
};

// components (to be set later)
let components;
let createComponentTag;
let createComponentDefinition;
let createComponentContentBefore;
let createComponentContentAfter;
let createComponentAttributes;
let createAttributeButton;
let createComponentButton;
let toggleArchiveButton;

let componentList;

let updateComponentId;
let updateComponentsForm;
let updateComponentContentBefore;
let updateComponentContentAfter;
let updateComponentAttributes;
let updateAttributeButton;
let updateComponentButton;

let styles;
let addStyleButton;
let flushEmptyStylesButton;


let inputs;
let outputs;
let outputStyles;

let confirm;
let window; // Actually not neccessary -- need to investigate
let document; // Actually not neccessary -- need to investigate

let downloadFullButton;
let downloadBackupButton;


const outputElementsByInput = new Map();
const inputElementsByOutput = new Map();// WeakMap?
const registeredComponents = {};




const hydrate = (outputElement, inputElement = inputElementsByOutput.get(outputElement))=>{
  merge(outputElement, JSON.parse(inputElement.dataset.attributes))
  if(outputElement.firstChild.textContent !== inputElement.dataset.contentBefore){
    outputElement.firstChild.textContent = inputElement.dataset.contentBefore;
  }
  if(outputElement.lastChild.textContent !== inputElement.dataset.contentAfter){
    outputElement.lastChild.textContent = inputElement.dataset.contentAfter;
  }
}

const createComponent = async ({
  tag='',
  definition='',
  attributes={},
  id=genId(),
  contentAfter='',
  contentBefore='',
}) => {
  const componentId = `${tag}[${id}]`;
  if (tag.includes("-")) {
    if (definition) {
      try {
        const instantiator = await import(definition);
        customElements.define(tag, instantiator.default);
      } catch (e) {
        throw new Error(
          `Failed to instantiate ${definition} : ${e.message}`
        );
      }
    }
  }
  registeredComponents[componentId] = {
    tag,
    attributes,
    definition,
    contentBefore,
    contentAfter,
    archived: false,
    id,
  }
  updateComponentList(componentList);
  return componentId;
};
const render = (inputElement) => {
  if(!outputElementsByInput.get(inputElement)){
    const id = `${inputElement.dataset.tag}[${inputElement.dataset.component_id}]`;
    inputElement = createInput(id, {
      ...inputElement.dataset,
      attributes:JSON.parse(inputElement.dataset.attributes),
    });
    const outputElement = outputElementsByInput.get(inputElement);
    const outputParent = outputElementsByInput.get(inputElement.parentElement) || outputs;
    if(!outputParent.contains(outputElement)){
      insertAfter(outputElement, outputParent.firstChild);
    }
  }

  const outputElement = outputElementsByInput.get(inputElement);
  const inputChildren = Array.from(inputElement.children);
  const outputChildren = Array.from(outputElement.children);
  outputChildren.shift();// The first element is a text node that will be ignored

  const length = Math.max(inputChildren.length, outputChildren.length);
  // DOING: Account for contentBefore, contentAfter
  let i;
  let outty;
  let outtyA;
  let outtyB;

  let change = false;

  for(i = 0; i < length; i++){
    outty = outputElementsByInput.get(inputChildren[i]);
    outtyA = outputChildren[i];
    if(outty !== outtyA){
      change = true;
      break;
    }
  }
  if(change){
    if(outputChildren.length > inputChildren.length) {
      // element deleted
      outputElement.removeChild(outtyA);
    }else if(outputChildren.length < inputChildren.length) {
      // element added
      insertAfter(outty, outputElement.firstChild);
      hydrate(outty);
    } else {
      //elements swapped
      let j;
      let outty2;
      for(j = i+1; j < length; j++){
        outty2 = outputElementsByInput.get(inputChildren[j]);
        outtyB = outputElement.children[j];
        if(outty2 !== outtyB){
          break;
        }
      }
      const preA = outputChildren[i-1];
      const preB = outputChildren[j-1];
      insertAfter(outty, preA || outputElement.firstChild);
      hydrate(outty);
      insertAfter(outty2, preB);
      hydrate(outty2);
    }
  }
  for(const inputElementChild of inputElement.children) {
    render(inputElementChild);
  }
}

const commitUpdate = ()=>{
  const id = `component_${updateComponentId.innerText}`;
  const inputElement = document.getElementById(id);
  const attributes = {};
  for (let i = 0; i < updateComponentAttributes.children.length; i += 2) {
    const k = updateComponentAttributes.children[i].value;
    const v = updateComponentAttributes.children[i + 1].value;
    if (k) {
      attributes[k] = v;
    }
  }
  inputElement.dataset.attributes = JSON.stringify(attributes);
  inputElement.dataset.contentBefore = updateComponentContentBefore.value ?? "";
  inputElement.dataset.contentAfter = updateComponentContentAfter.value ?? "";
  hydrate(outputElementsByInput.get(inputElement));
  updateInput(inputElement);
}

const setCreateForm = (id) => {
  const {
    tag,
    attributes,
    contentBefore = "",
    contentAfter = "",
  } = registeredComponents[id];

  createComponentTag.value = tag;
  createComponentContentBefore.value = contentBefore;
  createComponentContentAfter.value = contentAfter;
  createComponentAttributes.innerHTML = "";
  for (const [key, value] of Object.entries(attributes)) {
    const k = document.createElement("input");
    k.value = key;
    const v = document.createElement("input");
    v.value = value;
    createComponentAttributes.append(k, v);
  }
};

const handleComponentListDblClick = ({target})=>{
  if(target !== componentList){
    setCreateForm(target.dataset.id);
  }
}

const setUpdateForm = (id) => {
  if(id){
    updateComponentsForm.classList.remove('hidden');
    const inputElement = document.getElementById(id);
    updateComponentId.innerText = id.split("_")[1];
    updateComponentContentBefore.value = inputElement.dataset.contentBefore;
    updateComponentContentAfter.value = inputElement.dataset.contentAfter;
    const attributes = JSON.parse(inputElement.dataset.attributes);
    updateComponentAttributes.innerHTML = "";
    for (const [key, value] of Object.entries(attributes)) {
      const k = document.createElement("input");
      k.value = key;
      const v = document.createElement("input");
      v.value = value;
      updateComponentAttributes.append(k, v);
    }
    highlightStyles(inputElement);
  } else {
    updateComponentsForm.classList.add('hidden');
    highlightStyles();
  }
}


const onInputFocus = (event)=>{
  event.preventDefault();
  event.stopPropagation();
  setUpdateForm(event.target.id);
}

const onInputBlur = () => {
  setUpdateForm();
}
const updateInput = (inputElement)=>{
  inputElement.dataset.contentBeforeTag = `${inputElement.dataset.tag}[${inputElement.dataset.component_id}:${inputElement.dataset.id}] ${stringifyAttributes(JSON.parse(inputElement.dataset.attributes))}`;
}

const createOutput = (inputElement) => {
  const outputElement = document.createElement(inputElement.dataset.tag);
  for (const [key, value] of Object.entries(JSON.parse(inputElement.dataset.attributes))) {
    outputElement.setAttribute(key, value);
  }
  outputElement.appendChild(document.createTextNode(inputElement.dataset.contentBefore || ""));
  outputElement.appendChild(document.createTextNode(inputElement.dataset.contentAfter || ""));
  outputElementsByInput.set(inputElement, outputElement);
  inputElementsByOutput.set(outputElement, inputElement);
  return outputElement;
}

const createInput = (id, {
  tag: nTag,
  attributes: nAttributes,
  contentBefore: nContentBefore,
  contentAfter: nContentAfter,
  id:nId }={} ) => {

  let {
    tag,
    attributes,
    contentBefore = "",
    contentAfter = "",
    id:component_id
  } = registeredComponents[id];

  tag = nTag ?? tag;
  attributes = nAttributes ?? attributes;
  contentBefore = nContentBefore ?? contentBefore;
  contentAfter = nContentAfter ?? contentAfter;

  const input_id = nId || genId();
  const inputElement = document.createElement("div");
  inputElement.id = `component_${input_id}`;
  inputElement.tabIndex = '';
  inputElement.dataset.tag = tag;
  inputElement.dataset.id = input_id;
  inputElement.dataset.component_id = component_id;
  inputElement.dataset.contentBefore = contentBefore;
  inputElement.dataset.contentAfter = contentAfter;
  inputElement.dataset.attributes = JSON.stringify(attributes);// Clone object;
  updateInput(inputElement);
  inputElement.draggable = true;
  inputElement.ondragstart = dragInput;
  inputElement.ondrop = handleDropOnInputs;
  inputElement.ondragover = allowDrop;
  inputElement.onfocus = onInputFocus;
  
  inputElement.onclick = onInputFocus;
  createOutput(inputElement);
  return inputElement;
}
const moveInputElement = (id, target)=>{
  const inputElement = window.document.getElementById(id);
  if(!inputElement.contains(target)){
    // const oldParent = target.parentElement;
    target.prepend(inputElement);
    // render(oldParent);
    render(target);
  }
}

const handleDropOnInputs = (event) => {
  const type = event.dataTransfer.getData("type");
  const id = event.dataTransfer.getData("id");
  switch(type){
    case "component":
      event.preventDefault();
      event.stopPropagation();
      const inputElement = createInput(id);
      event.target.prepend(inputElement);
      render(event.target);
      break;
    case "input":
      event.preventDefault();
      event.stopPropagation();
      moveInputElement(id, event.target);
      break;
  }
};


const deleteInput = (inputElement)=>{
  for(const child of inputElement.children){
    deleteInput(child);
  }
  const outputElement = outputElementsByInput.get(inputElement);
  if(outputElement.parentElement){
    outputElement.parentElement.removeChild(outputElement);
  }else if(outputs.contains(outputElement)){
    outputs.removeChild(outputElement);
  }
  inputElement.parentElement.removeChild(inputElement);
}

const componentsFromJSON = async (data) =>{
  for (const { tag, definition, attributes, contentBefore, contentAfter, id } of data) {
    await createComponent({ tag, definition, attributes, contentBefore, contentAfter, id })
  }
}

const setCSSForm = (list=[]) => {
  styles.innerHTML = "";
  for(const {selectorText, body} of list){
    const s = document.createElement("span");
    s.contentEditable = true;
    s.placeholder = "selector";
    s.innerHTML = selectorText;
    const r = document.createElement("span");
    r.contentEditable = true;
    r.placeholder = "rule"
    r.innerHTML = body;
    styles.append(s, r);
  }
}
const loadChild = (child, parentElement) => {
  for(const potentialInput of child.children){
    const dataset = {};
    for(const {name, value} of potentialInput.attributes){
      const [prefix, key] = name.split("-");
      if(prefix === 'data'){
        dataset[key] = value;
      }
    }
    const id = `${dataset.tag}[${dataset.component_id}]`;
    const inputElement = createInput(id, {
      ...dataset,
      attributes:JSON.parse(dataset.attributes || "{}"),
    });
    parentElement.append(inputElement);
    render(inputs);
    for(const kid of child.children){
      loadChild(kid, inputElement);
    }
    
  }
}
const onFileLoaded = async (file)=>{
  const parser = new DOMParser();
  const loadedDoc = parser.parseFromString(file, "application/xml");
  const components = JSON.parse(loadedDoc.getElementById("components").innerHTML);
  await componentsFromJSON(components);
  outputStyles.innerHTML += loadedDoc.getElementById("styles").innerHTML;
  setCSSForm(rules(outputs).map(({selectorText, style})=>{
    const body = [];
    for(let i = 0; i < style.length; i ++){
      const key = style[i];
      const value = style[key];
      body.push(key);
      body.push(":");
      body.push(value);
      body.push(';');
    }
    return {selectorText, body: body.join('\n') };
  }));
  // TODO: parse body into inputs
  // inputs.innerHTML = loadedDoc.getElementById("inputs").innerHTML;
  // for(const child of inputs.children){
  //   render(child);
  // }
  
  loadChild(loadedDoc.getElementById("inputs"), inputs);
  render(inputs);
}


          

const handleDropOnBody = (event) => {
  const type = event.dataTransfer.getData("type");
  const id = event.dataTransfer.getData("id");  
  switch(type){
    case "component":
        event.preventDefault();
        event.stopPropagation();
        const target = registeredComponents[id];
        if(confirm(`${target.archived ? "Unarchive" : "Archive"} Component ${id}?`)){
          target.archived = !target.archived;
          updateComponentList(componentList);
        }
      break;
    case "input":
      event.preventDefault();
      event.stopPropagation();
      if(confirm(`Delete Input ${id.split('_')[1]}?`)) {
        deleteInput(document.getElementById(id));
      }
      break;
    }
    if(event.dataTransfer.items || event.dataTransfer.files.length){
      event.preventDefault();
      event.stopPropagation();
      const files = [];
      if (event.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < event.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (event.dataTransfer.items[i].kind === "file") {
            var file = event.dataTransfer.items[i].getAsFile();
            files.push(file);
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < event.dataTransfer.files.length; i++) {
          files.push(event.dataTransfer.files[i]);
        }
      }
      const reader = new FileReader();
      reader.onload = async function (event) {
        try {
          onFileLoaded(event.target.result);
        } catch (e) {
          throw new Error(`Error reading file: ${e.message}`);
        }
      };
      for (const file of files) {
        reader.readAsText(file);
      }
    }
}

const updateComponentList = (componentsList) => {
  componentsList.innerHTML = "";
  for (const [
    componentId,
    {tag, attributes, contentBefore, contentAfter, archived},
  ] of Object.entries(registeredComponents)) {
    const li = document.createElement("li");
    li.dataset.id = componentId;
    li.draggable = true;
    li.ondragstart = dragComponent;
    li.innerText = componentId;
    li.title = processHTML(
      `<${tag} ${stringifyAttributes(attributes)} >` +
        (contentBefore || "") + "{}" + "" + (contentAfter || "") +
        `</${tag}>`
    );
    componentsList.appendChild(li);
    if(archived){
      li.classList.add('archived');
    }
  }
};

const createComponentFromForm = async (clickEvent)=>{
    const tag = (createComponentTag.value || "").toLowerCase().trim();
    if (!tag) {
      alert('must define tag');
      return;
    }
    const contentBefore = createComponentContentBefore.value || "";
    const contentAfter = createComponentContentAfter.value || "";
    const definition = createComponentDefinition.value || "";
    const attributes = {};
    for (let i = 0; i < createComponentAttributes.children.length; i += 2) {
      const k = createComponentAttributes.children[i].value;
      const v = createComponentAttributes.children[i + 1].value;
      if (k) {
        attributes[k] = v;
      }
    }
    createComponentTag.value = "";
    createComponentContentBefore.value = "";
    createComponentContentAfter.value = "";
    createComponentDefinition.value = "";
    createComponentAttributes.innerHTML = "";
    //
    await createComponent({ tag, definition, attributes, contentBefore, contentAfter });
}

const handleClickOutput = ({target})=>inputElementsByOutput.get(target).focus();

const highlightStyles = (inputElement) => {
  if(inputElement){
    const outputElement = outputElementsByInput.get(inputElement);
    const selectors = match(outputElement, outputs);
    for (let i = 0; i < styles.children.length; i += 2) {
      const s = styles.children[i];
      const r = styles.children[i+1];
      if(selectors.has(s.innerText.trim())){
        s.classList.add("matched");
        r.classList.add("matched");
      }else{
        s.classList.remove("matched");
        r.classList.remove("matched");
      }
    }
  }else{
    for (let i = 0; i < styles.children.length; i++) {
      const q = styles.children[i];
      q.classList.remove("matched");
    }
  }
}

const flushEmptyStyles = ()=>{
  for (let i = 0; i < styles.children.length; i += 2) {
    const s = styles.children[i];
    const r = styles.children[i+1];
    if(!s.innerText.trim() && !r.innerText.trim()){
      styles.removeChild(s);
      styles.removeChild(r);
      s.classList.add("matched");
      i-=2;
    }
  }
}

const addStyle = ()=>{
  const s = document.createElement("span");
  s.contentEditable = true;
  s.placeholder = "selector";
  const r = document.createElement("span");
  r.contentEditable = true;
  r.placeholder = "rule"
  styles.append(s, r);
}

const syncStyles = ()=> {
  const styleList = [];
  for (let i = 0; i < styles.children.length; i += 2) {
    const s = styles.children[i].innerText;
    const r = styles.children[i + 1].innerText;
    if (s) {
      styleList.push(
`${s}{
${r}
}
`);
    }
  }
  outputStyles.innerHTML = styleList.join('\n');
}

import { generateImportStatements, generateFull, generateBackup, generateBackupHTML } from "./exports.mjs";


const setHTMLCode = ()=>{
  const style = outputStyles.innerHTML;
  const FULL_TEXT = `data:text/plain;charset=utf-8,${encodeURIComponent(
    generateFull(
      processHTML(String(outputs.innerHTML)),
      style,
      generateImportStatements(registeredComponents)))}`;
  const BACKUP_TEXT = `data:text/plain;charset=utf-8,${encodeURIComponent(generateBackup(
    JSON.stringify(Object.values(registeredComponents), null, ' '),
    style,
    generateBackupHTML(inputs)))}`;
  downloadFullButton.setAttribute("href", FULL_TEXT);
  downloadBackupButton.setAttribute("href", BACKUP_TEXT);
}

const toggleArchive = ()=>{
  componentList.classList.toggle('show-archive');
}


export default async ({ path }) => {
  window = path[0];
  confirm = window.confirm;
  document = window.document;

  // Attach
  components = window.document.getElementById("components");
  createComponentTag = window.document.getElementById("create-component-tag");
  createComponentDefinition = window.document.getElementById("create-component-definition");
  createComponentContentBefore = window.document.getElementById("create-component-content-before");
  createComponentContentAfter = window.document.getElementById("create-component-content-after");
  createComponentAttributes = window.document.getElementById("create-component-attributes");
  createAttributeButton = window.document.getElementById("create-attribute-button");
  createAttributeButton.addEventListener("click", addAttribute(createComponentAttributes))
  createComponentButton = window.document.getElementById("create-component-button");
  createComponentButton.addEventListener('click', createComponentFromForm);
  toggleArchiveButton = window.document.getElementById("toggle-archive");
  toggleArchiveButton.addEventListener('click', toggleArchive)

  componentList = window.document.getElementById("component-list");
  componentList.addEventListener("dblclick", handleComponentListDblClick);

  updateComponentsForm = window.document.getElementById("update-components");
  updateComponentId = window.document.getElementById("update-component-id");
  updateComponentContentBefore = window.document.getElementById("update-component-content-before");
  updateComponentContentAfter = window.document.getElementById("update-component-content-after");
  updateComponentAttributes = window.document.getElementById("update-component-attributes");
  updateAttributeButton = window.document.getElementById("update-attribute-button");
  updateAttributeButton.addEventListener("click", addAttribute(updateComponentAttributes));

  updateComponentButton = window.document.getElementById("update-component-button");

  styles = window.document.getElementById("styles");
  addStyleButton = window.document.getElementById("add-style");
  addStyleButton.addEventListener('click', addStyle);
  flushEmptyStylesButton = window.document.getElementById("flush-empty-styles");
  flushEmptyStylesButton.addEventListener("click", flushEmptyStyles);
  styles.addEventListener('keyup', syncStyles);
  // inputs
  inputs = window.document.getElementById("inputs");
  inputs.ondrop = handleDropOnInputs;
  inputs.ondragover = allowDrop; 
  inputs.addEventListener('click', onInputBlur);


  // outputs: note, we use the shadow root instead of the outputs element directly as we want o isolate styles
  outputs = window.document.getElementById("outputs").attachShadow({mode:'open'});
  window.shadow = outputs;
  outputStyles = outputs.appendChild(document.createElement('style'));

  outputElementsByInput.set(inputs, outputs);
  inputElementsByOutput.set(outputs, inputs);


  window.document.body.ondrop = handleDropOnBody;
  window.document.body.ondragover = allowDrop;


  outputs.addEventListener('click', handleClickOutput);

  updateComponentButton.addEventListener('click', commitUpdate);

  updateComponentAttributes.addEventListener("click", setCreateForm);


  downloadFullButton = document.getElementById('download-full-button');
  downloadBackupButton = document.getElementById('download-backup-button');
  

  const observer = new MutationObserver(setHTMLCode);

  // // Start observing the target node for configured mutations
  observer.observe(outputs, { attributes: true, childList: true, subtree: true });
  observer.observe(componentList, { attributes: true, childList: true, subtree: true });
  setHTMLCode();

  // initialize components
  try {
    const loaded = await window.fetch(DEFAULT_URL);
      if(!loaded.ok){
        throw new Error(defaults.status)
      }
      onFileLoaded(await loaded.text());
      console.log(`conponents loaded.`);
  }catch ({message}) {
    console.log(`conponents not loaded: ${message}`);
  }
}