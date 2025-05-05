import { Integrate } from "../lib/integrate.js";
const Registries = {
  images: new Integrate.Registry(),
  items: new Integrate.Registry(),
  blocks: new Integrate.Registry(),
  entities: new Integrate.Registry(),
  statuses: new Integrate.Registry(),
  vfx: new Integrate.Registry(),
  worldgen: new Integrate.Registry(),
  //Slightly odd registries
  deathmsg: new Integrate.Registry(),
  type: Integrate.types
};
export { Registries };
