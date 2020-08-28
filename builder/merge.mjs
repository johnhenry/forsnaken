const diff = (originalEntries, newAttributes)=>{
  const originalAttributes = Object.fromEntries(originalEntries);
  // List of desired attribures
  for(const [name, value] of originalEntries){
    if(newAttributes[name] === value){
      // If name and value are similar in both, we delete them as they are not necessary.
      delete newAttributes[name];
      delete originalAttributes[name];
    }else if (!(name in newAttributes)) {
      // If value with name doesnt' exist in desired attributes, mark it for deletion.
      newAttributes[name] = null
    }
  }
  // Create "diff" objects. Items in originalAttributes will be overwritten by those in newAttributes
  return { 
    ...originalAttributes,
    ...newAttributes
  };
}

export default (element, newAttributes)=>{
  const originalEntries = Array.from(element.attributes).map(({name, value})=>[name, value]);
  // Create "diff" objects. Items in originalAttributes will be overwritten by those in newAttributes
  const mergedAttributes = diff(
    originalEntries, newAttributes);
  for(const [key, value] of Object.entries(mergedAttributes) ){
    if(value === null){
      // Remove values marked for deletion
      element.removeAttribute(key);
    }else{
      // set values marked for change
      element.setAttribute(key, value);
    }
  }
}