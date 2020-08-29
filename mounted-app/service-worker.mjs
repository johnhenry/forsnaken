//https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/serviceworker
// import { pathToRegexp } from "https://johnhenry.github.io/vendor/path-to-regexp@6.1.0/index.js";
const updateRequest = async (oldRequest, newURL, newInit ={}) => {
  const oldInit = {};
  for(const key of Object.keys(Request.prototype)){
    if(key === 'url'){
      continue;
    }
    oldInit[key] = oldRequest[key];
  }
  if (oldRequest.method.toUpperCase() !== 'HEAD' && oldRequest.method.toUpperCase() !== 'GET') {
    const blob = await oldRequest.blob();
    if(blob.size > 0){
      oldInit.body = blob;
    }
  }
  return new Request(newURL || oldRequest.url, {...oldInit, ...newInit});  
}
const Route = class {
  constructor(action, match = false){
    this.__action = action;
    if(typeof action === "string"){
      this.__action = ()=>fetch(action);
    }
    if(match === false){
      this.__match = {
        url: false,
        method: false,
        headers: false,
        body: false,
      }
    }else if(typeof match === 'string' || match instanceof RegExp){
      this.__match = {
        url: match,
        method: false,
        headers: false,
        body: false,
      }
    }else{
      this.__match = {
        url: match.url || false,
        method: match.method || false,
        headers: match.headers || false,
        body: match.body || false,
      }
    }
  }
  __test(request){
    let match = this.__match;
    if(match.url){
      if(match.url instanceof RegExp){
        if(!match.url.test(request.url)){
          return false;
        };
      } else{ 
        if(match.url !== request.url){
          return false;
        }
      }
    }
    if(match.method){
      if(match.method instanceof RegExp){
        if(!match.method.test(request.method)){
          return false;
        };
      } else{ 
        if(match.method !== request.method){
          return false;
        }
      }
    }
    if(match.headers){
      for(const [header, match] of Object.entries(match.headers)){
        const value = request.headers.get(header);
        if(match instanceof RegExp){
          if(!match.test(value)){
            return false;
          };
        } else{ 
          if(match !== value){
            return false;
          }
        }
      }
    }
    if(match.body){
      if(match.body instanceof RegExp){
        if(!match.body.test(request.body)){
          return false;
        };
      } else { 
        if(match.body !== request.body){
          return false;
        }
      }
    }
    return true;
  }
  __exec(request){
    const output = {};
    let match = this.__match;
    if(match.url) {

      if(match.url instanceof RegExp){
        output.url = match.url.exec(request.url);

      } else { 
        output.url = request.url;
      }
    }
    if(match.method) {
      if(match.method instanceof RegExp){
        output.method = match.method.exec(request.method);
      } else { 
        output.method = request.method;
      }
    }
    if(match.headers) {
      output.headers = {};
      for(const [header, match] of Object.entries(match.headers)){
        const value = request.headers.get(header);
        if(match instanceof RegExp){
          output.headers[header] = match.exec(value);
        } else { 
          output.headers[header] = value;
        }
      }
    }
    if(match.body) {
      if(match.body instanceof RegExp){
        output.body = match.body.exec(request.body)
      } else { 
        output.body = request.body;
      }
    }
    return output;
  }
  async send(currentRequest, currentResponse){
    if(this.__test(currentRequest)){
      return this.__action(currentRequest, currentResponse, this.__exec(currentRequest))
    }
  }
}

const DefaultRoute = new Route((req)=>fetch(req));

const Router = class {
  constructor( ...routes){
    this.__routes = routes;
  }
  get DefaultRoute (){
    return __routes[__routes.length -1];
  }
  async routeEvent(event){
    let currentRequest = event.request.clone();
    let currentResponse;
    try{
      for(const route of this.__routes){
        const res = await route.send(currentRequest, currentResponse);
        if (res instanceof Response) {
          return res;
        } else if (res === undefined) {
          // skip current routes
          continue;
        } else if(res === null) {
          // skip to default route;
          try{
            return this.DefaultRoute.send(event.request);
          }catch(error){
            return new Response(error.toString(), {status:500});
          }
        } else if(typeof res === "number") {
          // return code with default message
          return new Response('', {status:res})
        } else if(typeof res === "string") {
          return new Response(res);
        } else if(Array.isArray(res)) {
          [currentRequest, currentResponse] = res;
        }
      }
      return this.DefaultRoute.send(event.request);
    } catch(error){
      return new Response(error, {status:500});
    }
  }
  get routes (){
    return this.__routes;
  }
}

const router = new Router(
  new Route(
    `${globalThis.location.origin}/backup.html`,
    `${globalThis.location.origin}/builder/backup.html`,
  ),
  new Route(
    async (req, b, match)=>{
      return fetch(await updateRequest(req, `http://localhost:8080/${match.url[1]||''}`, {mode:"cors"}));
    },
    new RegExp(`^${globalThis.location.origin}\/?(.+)?$`)
  ),
  DefaultRoute);

globalThis.addEventListener('fetch', (event) => {
  event.respondWith(router.routeEvent(event));
});

