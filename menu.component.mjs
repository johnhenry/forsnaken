// HTML Details, Select, Input[type=radio]

export default class extends HTMLElement {
  constructor() {
    super();
    this.kids = new Set();
    this.kidsByKey = new Map();
    this.shadow = this.attachShadow( { mode: 'open' } );
    this.slotted = this.shadow.appendChild(document.createElement('slot'));
    this.slotted.style = 'display:none';    
    this.content = this.shadow.appendChild(document.createElement('span'));
    this.content.part = 'content';
    this.pop = this.pop.bind(this);
    this.slotChange = this.slotChange.bind(this);
    this.slotted.addEventListener('slotchange', this.slotChange);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onfocus = this.onFocus.bind(this);
  }
  onFocus(){
    if(this.lastClicked === undefined){
      this.content?.firstChild?.focus?.();
    }
  }

  onKeyDown(event) {
    switch(event.keyCode) {
      case 13: case 32: // enter, space
        this.shadow?.activeElement?.click();
        // event.stopPropagation();
      break;
      case 37: case 38: // left, up
        try {
          this.shadow.activeElement.previousSibling.focus();
        } catch {
          this.shadow.activeElement.parentElement.lastChild.focus();
        }
      break;
      case 39: case 40: // right, down
        try {
          this.shadow.activeElement.nextSibling.focus();
        } catch {
          this.shadow.activeElement.parentElement.firstChild.focus();
        }
      break;
    }
  }
  connectedCallback() {
    this.endEvent = this.dataset.endEvent || 'end';
  }
  static get observedAttributes() { return ['pushed']; }
  attributeChangedCallback(name, old, current) {
    switch(name){
      case 'pushed':
        if(old === current){
          return;
        }
        if(current === null){
          const node = this
          this.reset();
          this.dispatchEvent(new CustomEvent('popped',
          { bubbles: true, composed: true, detail: {pushed: old, clicked:this.lastClicked, node },   }));
          return;
        }
        // Set timeout to allow this.slotChange to populate this.kids
        setTimeout(()=>{
          const length = this.kids.size;
          for(const child of this.kids) {
            child.onclick = null;
          }
          let element;
          if(!Number.isNaN(Number(current))){
            element = [...this.kids][((Number(current)) % length  + length ) % length];
          } else { 
            element = this.kidsByKey.get(current);
          }
          if(!element) {
            element = [...this.kids][0];
          }
          const template = element.getElementsByTagName('template')[0];
          let node;
          if (template) {
            this.content.innerHTML = '';
            node = template.content.cloneNode(true);
            this.content.appendChild(node);
            element.dataset.endEvent 
              = element.dataset.endEvent || this.endEvent;
            this.content.addEventListener(
              element.dataset.endEvent,
              this.pop, { once :true});
          }
          this.removeEventListener('keydown', this.onKeyDown);
          this.dispatchEvent(new CustomEvent('pushed',
          { bubbles: true, composed: true,  detail: {pushed: current, clicked: this.lastClicked, node} }));
        })
    }
  }
  slotChange ({ target } ) {
    const children = target.assignedElements();
    if (!children.length){
      return;
    }
    this.kids.clear();
    this.kidsByKey.clear();
    for(const child of children){
      this.kids.add(child);
      if(child.dataset.key){
        this.kidsByKey.set(child.dataset.key, child);
      }
      this.removeChild(child); // Is this necessary?
    }
    this.reset();
  }
  pop(event) {
    if(event) {
      event.stopPropagation();
    }
    this.pushed = null;
  }
  push(id=0){
    this.pushed = id;
  }
  reset() {
    this.content.innerHTML = '';
    let index = 0;
    for(const child of this.kids) {
      const kid = this.content.appendChild(child);
      kid.part = 'item';

      if((kid.tabIndex = String(index)) === this.lastClicked) {
        kid.focus();
      }
      if(kid.getElementsByTagName('template')[0]){
        let key = null;
        for(const [k, value] of this.kidsByKey.entries()) {
          if(kid === value){
            key = k;
            break;
          }
        }
        
        const pushval = key === null ? kid.tabIndex : key;
        kid.onclick = () => {
          this.lastClicked = String(kid.tabIndex);
          this.pushed = pushval;
        };
      } else {
        kid.onclick = (event) => {
          event.stopPropagation();
          this.dispatchEvent(
            new Event(this.endEvent,
            { bubbles : true }));
        };
      }
      index++;
    }
    this.addEventListener('keydown', this.onKeyDown);
    this.content.removeEventListener(this.endEvent, this.pop);
    this.dispatchEvent(new Event('reset'));
  }
  set pushed (detail) {
    if (detail === null) {
      this.removeAttribute('pushed');
    } else {
      this.setAttribute('pushed', detail);
    }
  }
  get pushed () {
    return this.getAttribute('pushed');
  }
}
