import Menu from "entitles/Menu.mjs";
export default function *(options, ...players){
  const menu = new Menu({ options, brains:players });

}