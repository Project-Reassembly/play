import { construct, constructFromType } from "../../../core/constructor.js";
import { index, rnd, roundNum } from "../../../core/number.js";
import { Registries } from "../../../core/registry.js";
import Integrate from "../../../lib/integrate.js";
import { createEffect, effectTimer, emitEffect, Explosion } from "../../../play/effects.js";
import { createPlayer, game } from "../../../play/game.js";
import { Log } from "../../../play/messaging.js";
import { blockSize } from "../../../scaling.js";
import { Corporation } from "../../item/corporation.js";
import { DroppedItemStack } from "../../item/dropped-itemstack.js";
import { ItemStack } from "../../item/item-stack.js";
import { patternedBulletExpulsion } from "../../projectile/yeeter.js";
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
    const pos = world.evaluator[
      this.targetHighValue ? "getHighValueTargetPosition" : "getLowValueTargetPosition"
    ](team);
    entiti.x = index.col(pos) * blockSize;
    entiti.y = index.row(pos) * blockSize;
    deliverEntity(entiti, true, world);
  }
}

function getTeamFromInput(inp) {
  if (inp === "$plr") return game.player.team;
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
) {
  const crp = constructFromType(Registries.corps.get(corp), Corporation);
  createPlayer(player, x, y, crp.player);
  game.player.health = game.player.maxHealth;
  game.player.statuses = {};
  game.player.team = corp;
  if (game.player.dead) {
    game.player.dead = false;
    game.player.addToWorld(iworld);
  }
  if (moveCamera) {
    ui.camera.x = game.player.x;
    ui.camera.y = game.player.y;
  }
  deliverEntity(game.player, false, iworld, true);
}

export function deliverEntity(ent, add = false, world, clearArea = false) {
  if (add) ent.addToWorld(world);
  ent.visible = false;
  ent.controllable = false;
  ent.tangible = false;
  emitEffect("land-target", ent);
  effectTimer.do(() => {
    let y = ui.camera.y - height / ui.camera.zoom;
    let life = (ent.y - y) / 20;
    patternedBulletExpulsion(
      ent.x,
      y,
      {
        lifetime: life - 1,
        speed: 20,
        trail: true,
        trailEffect: "land-trail",
        drawer: { hidden: true },
        collides: false,
        fires: 9,
        fire: { damage: 6, lifetime: 2880, interval: 20, status: "burning", statusDuration: 120 },
        fireSpread: 50,
        fragNumber: 9,
        fragSpacing: 40,
        fragSpread: 40,
        fragBullet: {
          lifetime: 20,
          speed: 30,
          decel: 1.5,
          pierce: 2,
          trail: true,
          trailEffect: "fire",
          status: "burning",
          statusDuration: 360,
          drawer: { shape: "rhombus", fill: "gray", width: 30, height: 8 },
          damage: [
            { amount: 20, type: "ballistic" },
            { amount: 40, type: "explosion", radius: 30 },
          ],
          despawnEffect: "explosion~30",
          fires: 2,
          fire: { damage: 6, lifetime: 1440, interval: 20, status: "burning", statusDuration: 120 },
          fireSpread: 10,
        },
      },
      1,
      90,
      0,
      0,
      world,
      ent,
    );
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
      for (let tick = 0; tick < 10; tick++)
        DroppedItemStack.create(
          new ItemStack("scrap", roundNum(rnd.float(2, 20))),
          world,
          ent.x,
          ent.y,
          rnd.float(4, 10),
          rnd.float(0, 360),
        );
      ent.visible = true;
      ent.controllable = true;
      ent.tangible = true;
    }, life);
  }, 180);
}
