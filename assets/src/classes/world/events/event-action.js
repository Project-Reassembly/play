import { construct, constructFromType } from "../../../core/constructor.js";
import { index } from "../../../core/number.js";
import { delay, Registries } from "../../../core/registry.js";
import { ui } from "../../../core/ui.js";
import Integrate from "../../../lib/integrate.js";
import { createEffect, effectTimer, emitEffect, Explosion } from "../../../play/effects.js";
import { createPlayer, game } from "../../../play/game.js";
import { Log } from "../../../play/messaging.js";
import { blockSize } from "../../../scaling.js";
import { Entity } from "../../entity/entity.js";
import { Corporation } from "../../item/corporation.js";
import { BulletModel } from "../../projectile/bullet-model.js";
import { World } from "../world.js";

export class WorldEventAction extends Integrate.RegisteredItem {
  /**
   * @param {World} world
   */
  execute(world) {}
}

export class MessageAction extends WorldEventAction {
  text = "Sample text";
  time = -1;
  /**
   * @param {World} world
   */
  execute(world) {
    Log.send(`${this.text}`, this.time === -1 ? undefined : +this.time);
  }
}

export class DeliverEntityAction extends WorldEventAction {
  entity = "scavenger";
  // aiming parameters
  targetTeam = "$plr";
  targetHighValue = false;
  /**
   * @param {World} world
   */
  execute(world) {
    const team = getTeamFromInput(this.targetTeam);
    let entiti = construct(Registries.entities.get(this.entity), "entity");
    const pos =
      world.evaluator[
        this.targetHighValue ? "getHighValueTargetPosition" : "getLowValueTargetPosition"
      ](team);
    entiti.x = index.col(pos) * blockSize;
    entiti.y = index.row(pos) * blockSize;
    deliverEntity(entiti, true, world);
  }
}

function getTeamFromInput(inp) {
  if (inp === "$plr") return game.player.entity.team;
  return `${inp}`;
}

// world.addEvent("iticorpspawn", 18000, (world) => {
//     Log.send("#i-ITI have sent a merchant to trade");
//     let entiti = construct(Registries.entities.get("iti-corporate-merchant"), "entity");
//     entiti.x = game.player.x + rnd.float(300, 800) * (tru(0.5) ? -1 : 1);
//     entiti.y = game.player.y + rnd.float(300, 800) * (tru(0.5) ? -1 : 1);
//     deliverEntity(entiti, true, world);
//   });
//   //bossfight in 3-ish mins
//   world.addEvent("scrapboss-warning", 36000, (world) => {
//     Log.send("#d-The Scrapper is descending...");
//   });
//   //bossfight
//   world.addEvent("scrapboss", 46800, (world) => {
//     Log.send("#4-The Scrapper has descended!");
//     let entiti = construct(Registries.entities.get("scrapper"), "entity");
//     entiti.x = game.player.x + rnd.float(300, 800) * (tru(0.5) ? -1 : 1);
//     entiti.y = game.player.y + rnd.float(300, 800) * (tru(0.5) ? -1 : 1);
//     deliverEntity(entiti, true, world);
//   });

// Makes a player with a bang
export function deliverPlayer(
  player = null,
  x,
  y,
  moveCamera = false,
  corp = "iti",
  iworld = world,
  nuke = true,
) {
  const crp = constructFromType(Registries.corps.get(corp), Corporation);
  createPlayer(player, x, y, crp.player);
  game.player.entity.health = game.player.entity.maxHealth;
  game.player.entity.statuses = {};
  game.player.entity.team = corp;
  if (game.player.entity.dead) {
    game.player.entity.dead = false;
    game.player.entity.addToWorld(iworld);
  }
  if (moveCamera) {
    ui.camera.x = game.player.entity.x;
    ui.camera.y = game.player.entity.y;
  }
  deliverEntity(game.player.entity, false, iworld, nuke);
}
/** @type {import("../../../core/registry.js").DelayedConstruction<BulletModel>} */
const deliverShotModel = delay(
  {
    lifetime: 1,
    collides: false,
    components: [
      { type: "movement", speed: 20 },
      { type: "vfx-trail", effect: "land-trail" },
      {
        type: "incendiary",
        fire: { damage: 6, lifetime: 2880, interval: 20, status: "burning", statusDuration: 120 },
        count: 9,
        spread: 50,
      },
      {
        type: "frag-bullet",
        number: 9,
        spacing: 40,
        spread: 40,
        bullet: {
          lifetime: 20,
          components: [
            { type: "movement", speed: 30, decel: 1.5 },
            { type: "pierce", amount: 2 },
            { type: "vfx-trail", effect: "fire" },
            { type: "status-infliction", effect: "burning", duration: 360 },
            { type: "shape-drawer", shape: "rhombus", fill: "#808080", width: 30, height: 8 },
            { type: "explosion", damage: 40, radius: 30 },
            { type: "damage", amount: 20, damageType: "ballistic" },
            {
              type: "incendiary",
              fire: {
                damage: 6,
                lifetime: 1440,
                interval: 20,
                status: "burning",
                statusDuration: 120,
              },
              count: 2,
              spread: 10,
            },
          ],
        },
      },
    ],
  },
  function () {
    return new BulletModel();
  },
  "hardcoded",
);
/** @type {import("../../../core/registry.js").DelayedConstruction<BulletModel>} */
const undeliverShotModel = delay(
  {
    lifetime: 1,
    collides: false,
    components: [
      { type: "movement", speed: 0, decel: -1 },
      { type: "vfx-trail", effect: "land-trail" },
    ],
  },
  function () {
    return new BulletModel();
  },
  "hardcoded",
);

export function deliverEntity(ent, add = false, world, clearArea = false) {
  if (add) ent.addToWorld(world);
  ent.visible = false;
  ent.controllable = false;
  ent.tangible = false;
  emitEffect("land-target", ent);
  effectTimer.do(() => {
    let y = ui.camera.y - height / ui.camera.zoom;
    let life = (ent.y - y) / 20;
    deliverShotModel.value
      .emit(ent.x, y, 1, 90, 0, 0, world, ent)
      .forEach((m) => (m.lifetime = life));
    effectTimer.do(() => {
      new Explosion({
        x: ent.x,
        y: ent.y,
        world: world,
        team: ent.team,
        radius: 150,
        amount: 5000,
        knockback: 0,
      }).create();
      if (clearArea)
        new Explosion({
          x: ent.x,
          y: ent.y,
          world: world,
          team: ent.team,
          radius: 800,
          amount: 500,
          knockback: 0,
        }).dealDamage();
      createEffect("land-wave", world, ent.x, ent.y, -Math.PI / 2, 1);
      createEffect("land-scorch", world, ent.x, ent.y, -Math.PI / 2, 1);
      // for (let tick = 0; tick < 10; tick++)
      //   DroppedItemStack.create(
      //     new ItemStack("scrap", roundNum(rnd.float(2, 20))),
      //     world,
      //     ent.x,
      //     ent.y,
      //     rnd.float(4, 10),
      //     rnd.float(0, 360),
      //   );
      ent.visible = true;
      ent.controllable = true;
      ent.tangible = true;
    }, life);
  }, 180);
  effectTimer.tick();
}
/** @param {Entity} ent  */
export function undeliverEntity(ent) {
  ent.world.entities.splice(ent.world.entities.indexOf(ent), 1);
  ent.visible = false;
  ent.controllable = false;
  ent.tangible = false;
  emitEffect("land-effect", ent);
  effectTimer.tick();

  let y = ui.camera.y - height / ui.camera.zoom;
  // s = ut + ½at²
  // u = 0
  // t = √(2s / a)
  let life = Math.sqrt(2 * (ent.y - y));
  undeliverShotModel.value
    .emit(ent.x, ent.y, 1, -90, 0, 0, world, ent)
    .forEach((m) => (m.lifetime = life));
}
