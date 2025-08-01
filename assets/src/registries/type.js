import { Registries } from "../core/registry.js";
import { RegisteredItem } from "../core/registered-item.js";
import {
  Component,
  DestructibleComponent,
  LegComponent,
  WeaponComponent,
  WeaponisedComponent,
} from "../classes/entity/component.js";
import { Entity } from "../classes/entity/entity.js";
import {
  EquippedEntity,
  InventoryEntity,
} from "../classes/entity/inventory-entity.js";
import { NPC } from "../classes/entity/npc.js";
import { Player } from "../classes/entity/player.js";
import { Bullet } from "../classes/projectile/bullet.js";
import { LaserBullet } from "../classes/projectile/laser-bullet.js";
import { ContinuousLaserBullet } from "../classes/projectile/continuous-laser-bullet.js";
import { Missile } from "../classes/projectile/missile.js";
import { CriticalBullet } from "../classes/projectile/critical.js";
import { PointBullet } from "../classes/projectile/point-bullet.js";
import {
  BlockLaunchedBullet,
  BlockLauncher,
} from "../classes/item/special-weapons/block-launcher.js";
import { Item } from "../classes/item/item.js";
import { PlaceableItem } from "../classes/item/placeable.js";
import { ItemStack } from "../classes/item/item-stack.js";
import { Throwable } from "../classes/item/throwable.js";
import { Weapon } from "../classes/item/weapon.js";
import { World } from "../classes/world/world.js";
import { Chunk } from "../classes/world/chunk.js";
import { Block } from "../classes/block/block.js";
import { Wall } from "../classes/block/defense/wall.js";
import { Ore, Tile } from "../classes/block/tile.js";
import { Container } from "../classes/block/container.js";
import { Crafter, Uncrafter } from "../classes/block/production/crafter.js";
import { Smelter } from "../classes/block/production/smelter.js";
import { TileProducer } from "../classes/block/production/tile-producer.js";
import { Drill } from "../classes/block/production/drill.js";
import { Conveyor, Unloader } from "../classes/block/conveyor.js";
import { SignBlock } from "../classes/block/decoration.js";
import { Bomb, NuclearBomb } from "../classes/block/defense/bomb.js";
import {
  CommandExecutorBlock,
  ItemCatalogBlock,
  StructureReaderBlock,
} from "../classes/block/devblocks.js";
import { StatusEffect } from "../classes/effect/status-effect.js";
import {
  ExplosionEffect,
  ImageParticleEmissionEffect,
  MultiEffect,
  NuclearExplosionEffect,
  ParticleEmissionEffect,
  TextParticleEmissionEffect,
  VisualEffect,
  WaveEmissionEffect,
} from "../play/effects.js";
import { VirtualBullet } from "../classes/projectile/virtual-bullet.js";
import { ModularTankEntity } from "../classes/entity/modular-tank.js";
import { TankAssemblyBay } from "../classes/block/tonq/tank-assembly-bay.js";
import { LandingPad, LaunchPad } from "../classes/block/capitalism/launch-pad.js";
import { PlasmaBlock, PlasmaPipe, PlasmaTank } from "../classes/block/plasma-pipe.js";
import {
  PlasmaCompressor,
  PlasmaDecompressor,
  PlasmaGenerator,
} from "../classes/block/plasma-gen-and-compressor.js";
import { Turret } from "../classes/block/defense/turret.js";
import { TurretBase, TurretController, TurretItem } from "../classes/block/defense/turret-components.js";
import { LightningEmissionEffect, LinearEffect, LinearMultiEffect, LineEmissionEffect } from "../play/line-effects.js";
//Basic
Registries.type.add("generic", RegisteredItem);
//Entities and parts
Registries.type.add("component", Component);
Registries.type.add("leg-component", LegComponent);
Registries.type.add("weapon-component", WeaponComponent);
Registries.type.add("weaponised-component", WeaponisedComponent);
Registries.type.add("destructible-component", DestructibleComponent);
Registries.type.add("entity", Entity);
Registries.type.add("inventory-entity", InventoryEntity);
Registries.type.add("equipped-entity", EquippedEntity);
Registries.type.add("npc", NPC);
Registries.type.add("player", Player);
Registries.type.add("modular-tank", ModularTankEntity);
//Projectiles
Registries.type.add("bullet", Bullet);
Registries.type.add("laser", LaserBullet);
Registries.type.add("continuous-laser", ContinuousLaserBullet);
Registries.type.add("missile", Missile);
Registries.type.add("critical", CriticalBullet);
Registries.type.add("point-bullet", PointBullet);
Registries.type.add("block-bullet", BlockLaunchedBullet);
Registries.type.add("virtual", VirtualBullet);
//Items
Registries.type.add("item", Item);
Registries.type.add("placeable", PlaceableItem);
Registries.type.add("itemstack", ItemStack);
Registries.type.add("equippable", EquippedEntity);
//Weapons
Registries.type.add("weapon", Weapon);
Registries.type.add("throwable", Throwable);
Registries.type.add("block-launcher", BlockLauncher);
//World
Registries.type.add("world", World);
Registries.type.add("chunk", Chunk);
// Registries.type.add("generator", Generator);
// Registries.type.add("tile-generator", TileGenerator);
// Registries.type.add("ore-generator", OreGenerator);
// Registries.type.add("block-generator", BlockGenerator);

// Registries.type.add("gen-options", GenerationOptions);
// Registries.type.add("tile-gen-options", TileGenerationOptions);
// Registries.type.add("ore-gen-options", OreGenerationOptions);
//Block
Registries.type.add("block", Block);
Registries.type.add("wall", Wall);
Registries.type.add("tile", Tile);
Registries.type.add("ore", Ore);
Registries.type.add("container", Container);
Registries.type.add("crafter", Crafter);
Registries.type.add("smelter", Smelter);
Registries.type.add("uncrafter", Uncrafter);
Registries.type.add("tile-producer", TileProducer);
Registries.type.add("drill", Drill);
Registries.type.add("conveyor", Conveyor);
Registries.type.add("unloader", Unloader);
Registries.type.add("sign", SignBlock);
Registries.type.add("plasma-block", PlasmaBlock);
Registries.type.add("plasma-pipe", PlasmaPipe);
Registries.type.add("plasma-generator", PlasmaGenerator);
Registries.type.add("plasma-tank", PlasmaTank);
Registries.type.add("plasma-compressor", PlasmaCompressor);
Registries.type.add("plasma-decompressor", PlasmaDecompressor);
Registries.type.add("bomb", Bomb);
Registries.type.add("nuclear-bomb", NuclearBomb);
Registries.type.add("tank-assembler", TankAssemblyBay);
//capitalism
Registries.type.add("launch-pad", LaunchPad);
Registries.type.add("landing-pad", LandingPad);
//Turret
Registries.type.add("turret", Turret);
Registries.type.add("turret-base", TurretBase);
Registries.type.add("turret-controller", TurretController);
Registries.type.add("turret-item", TurretItem);
//Dev blocks
Registries.type.add("dev::structurereader", StructureReaderBlock);
Registries.type.add("dev::itemcatalog", ItemCatalogBlock);
Registries.type.add("dev::commandblock", CommandExecutorBlock);
//Effects
Registries.type.add("status-effect", StatusEffect);
Registries.type.add("visual-effect", VisualEffect);

Registries.type.add("particle-emission", ParticleEmissionEffect);
Registries.type.add("image-particle-emission", ImageParticleEmissionEffect);
Registries.type.add("text-particle-emission", TextParticleEmissionEffect);
Registries.type.add("wave-emission", WaveEmissionEffect);
Registries.type.add("multi-effect", MultiEffect);
Registries.type.add("explosion", ExplosionEffect);
Registries.type.add("nuclear-explosion", NuclearExplosionEffect);

Registries.type.add("linear-effect", LinearEffect);
Registries.type.add("linear-multi", LinearMultiEffect);
Registries.type.add("line-emission", LineEmissionEffect);
Registries.type.add("lightning-emission", LightningEmissionEffect);
