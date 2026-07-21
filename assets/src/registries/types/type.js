import { Block } from "../../classes/block/block.js";
import { LandingPad, LaunchPad } from "../../classes/block/capitalism/launch-pad.js";
import { Container } from "../../classes/block/container.js";
import { Conveyor, Unloader } from "../../classes/block/conveyor.js";
import { SignBlock } from "../../classes/block/decoration.js";
import { Bomb, NuclearBomb } from "../../classes/block/defense/bomb.js";
import {
  TurretBase,
  TurretController,
  TurretItem,
} from "../../classes/block/defense/turret-components.js";
import { Turret } from "../../classes/block/defense/turret.js";
import { Wall } from "../../classes/block/defense/wall.js";
import {
  CommandExecutorBlock,
  ItemCatalogBlock,
  StructureReaderBlock,
} from "../../classes/block/devblocks.js";
import {
  PlasmaCompressor,
  PlasmaDecompressor,
  PlasmaGenerator,
} from "../../classes/block/plasma-gen-and-compressor.js";
import { PlasmaBlock, PlasmaPipe, PlasmaTank } from "../../classes/block/plasma-pipe.js";
import { Crafter, Uncrafter } from "../../classes/block/production/crafter.js";
import { Drill } from "../../classes/block/production/drill.js";
import { Smelter } from "../../classes/block/production/smelter.js";
import { TileProducer } from "../../classes/block/production/tile-producer.js";
import { Tile } from "../../classes/block/tile.js";
import { TankAssemblyBay } from "../../classes/block/tonq/tank-assembly-bay.js";
import { StatusEffect } from "../../classes/effect/status-effect.js";
import {
  AICondition,
  AlternativeCondition,
  CombinedCondition,
  DataComparisonCondition,
  HasTargetCondition,
  KeyDownCondition,
  MouseDownCondition,
  NearTargetCondition,
  StoredTargetCondition,
} from "../../classes/entity/ai/ai-conditions.js";
import {
  AIAttackTask,
  AITask,
  CreateBulletsTask,
  RetargetTask,
  SetDataTask,
  ShootBulletsTask,
  TrackTargetTask,
} from "../../classes/entity/ai/ai-tasks.js";
import {
  Component,
  DestructibleComponent,
  LegComponent,
  WeaponComponent,
  WeaponisedComponent,
} from "../../classes/entity/entity-part.js";
import { Entity } from "../../classes/entity/entity.js";
import { EquippedEntity, InventoryEntity } from "../../classes/entity/inventory-entity.js";
import { ModularTankEntity } from "../../classes/entity/modular-tank.js";
import { NPC } from "../../classes/entity/npc.js";
import { Player } from "../../classes/entity/player.js";
import { InteractableEntity } from "../../classes/interaction/interactable-entity.js";
import { Accessory } from "../../classes/item/accessory.js";
import { Equippable } from "../../classes/item/equippable.js";
import { ItemStack } from "../../classes/item/item-stack.js";
import { Item } from "../../classes/item/item.js";
import { PlaceableItem } from "../../classes/item/placeable.js";
import {
  BlockLauncher
} from "../../classes/item/special-weapons/block-launcher.js";
import { Throwable } from "../../classes/item/throwable.js";
import { Weapon } from "../../classes/item/weapon.js";
import { Chunk } from "../../classes/world/chunk.js";
import { World } from "../../classes/world/world.js";
import { RegisteredItem } from "../../core/registered-item.js";
import { TypeRegistries } from "../../core/registry.js";
import {
  ExplosionEffect,
  ImageParticleEmissionEffect,
  MultiEffect,
  NuclearExplosionEffect,
  ParticleEmissionEffect,
  TextParticleEmissionEffect,
  VisualEffect,
  WaveEmissionEffect,
} from "../../play/effects.js";
import {
  LightningEmissionEffect,
  LinearEffect,
  LinearMultiEffect,
  LineEmissionEffect,
} from "../../play/line-effects.js";
//Basic
TypeRegistries.default.add("generic", RegisteredItem);
//Entities and parts
TypeRegistries.default.add("component", Component);
TypeRegistries.default.add("leg-component", LegComponent);
TypeRegistries.default.add("weapon-component", WeaponComponent);
TypeRegistries.default.add("weaponised-component", WeaponisedComponent);
TypeRegistries.default.add("destructible-component", DestructibleComponent);
TypeRegistries.default.add("entity", Entity);
TypeRegistries.default.add("inventory-entity", InventoryEntity);
TypeRegistries.default.add("equipped-entity", EquippedEntity);
TypeRegistries.default.add("interactable-entity", InteractableEntity);
TypeRegistries.default.add("npc", NPC);
TypeRegistries.default.add("player", Player);
TypeRegistries.default.add("modular-tank", ModularTankEntity);
//Projectiles (replaced by BulletModel)
// TypeRegistries.default.add("bullet", BulletInstance);
// // TypeRegistries.default.add("missile", Missile);
// TypeRegistries.default.add("critical", CriticalBullet);
// TypeRegistries.default.add("point-bullet", PointBullet);
// TypeRegistries.default.add("block-bullet", BlockLaunchedBullet);
//Items
TypeRegistries.default.add("item", Item);
TypeRegistries.default.add("placeable", PlaceableItem);
TypeRegistries.default.add("itemstack", ItemStack);
TypeRegistries.default.add("equippable", Equippable);
TypeRegistries.default.add("accessory", Accessory);
//Weapons
TypeRegistries.default.add("weapon", Weapon);
TypeRegistries.default.add("throwable", Throwable);
TypeRegistries.default.add("block-launcher", BlockLauncher);
//World
TypeRegistries.default.add("world", World);
TypeRegistries.default.add("chunk", Chunk);
//Block
TypeRegistries.default.add("block", Block);
TypeRegistries.default.add("wall", Wall);
TypeRegistries.default.add("tile", Tile);
TypeRegistries.default.add("container", Container);
TypeRegistries.default.add("crafter", Crafter);
TypeRegistries.default.add("smelter", Smelter);
TypeRegistries.default.add("uncrafter", Uncrafter);
TypeRegistries.default.add("tile-producer", TileProducer);
TypeRegistries.default.add("drill", Drill);
TypeRegistries.default.add("conveyor", Conveyor);
TypeRegistries.default.add("unloader", Unloader);
TypeRegistries.default.add("sign", SignBlock);
TypeRegistries.default.add("plasma-block", PlasmaBlock);
TypeRegistries.default.add("plasma-pipe", PlasmaPipe);
TypeRegistries.default.add("plasma-generator", PlasmaGenerator);
TypeRegistries.default.add("plasma-tank", PlasmaTank);
TypeRegistries.default.add("plasma-compressor", PlasmaCompressor);
TypeRegistries.default.add("plasma-decompressor", PlasmaDecompressor);
TypeRegistries.default.add("bomb", Bomb);
TypeRegistries.default.add("nuclear-bomb", NuclearBomb);
TypeRegistries.default.add("tank-assembler", TankAssemblyBay);
//capitalism
TypeRegistries.default.add("launch-pad", LaunchPad);
TypeRegistries.default.add("landing-pad", LandingPad);
//Turret
TypeRegistries.default.add("turret", Turret);
TypeRegistries.default.add("turret-base", TurretBase);
TypeRegistries.default.add("turret-controller", TurretController);
TypeRegistries.default.add("turret-item", TurretItem);
//Dev blocks
TypeRegistries.default.add("dev::structurereader", StructureReaderBlock);
TypeRegistries.default.add("dev::itemcatalog", ItemCatalogBlock);
TypeRegistries.default.add("dev::commandblock", CommandExecutorBlock);
//Effects
TypeRegistries.default.add("status-effect", StatusEffect);
TypeRegistries.default.add("visual-effect", VisualEffect);

TypeRegistries.default.add("particle-emission", ParticleEmissionEffect);
TypeRegistries.default.add("image-particle-emission", ImageParticleEmissionEffect);
TypeRegistries.default.add("text-particle-emission", TextParticleEmissionEffect);
TypeRegistries.default.add("wave-emission", WaveEmissionEffect);
TypeRegistries.default.add("multi-effect", MultiEffect);
TypeRegistries.default.add("explosion", ExplosionEffect);
TypeRegistries.default.add("nuclear-explosion", NuclearExplosionEffect);

TypeRegistries.default.add("linear-effect", LinearEffect);
TypeRegistries.default.add("linear-multi", LinearMultiEffect);
TypeRegistries.default.add("line-emission", LineEmissionEffect);
TypeRegistries.default.add("lightning-emission", LightningEmissionEffect);
//AI
TypeRegistries.default.add("ai.nothing", AITask);
TypeRegistries.default.add("ai.attack", AIAttackTask);
TypeRegistries.default.add("ai.shoot-bullet", ShootBulletsTask);
TypeRegistries.default.add("ai.create-bullet", CreateBulletsTask);
TypeRegistries.default.add("ai.retarget", RetargetTask);
TypeRegistries.default.add("ai.follow", TrackTargetTask);

TypeRegistries.default.add("ai.set-data", SetDataTask);

TypeRegistries.default.add("aicon.constant", AICondition);
TypeRegistries.default.add("aicon.has-target", HasTargetCondition);
TypeRegistries.default.add("aicon.stored-target", StoredTargetCondition);
TypeRegistries.default.add("aicon.near-target", NearTargetCondition);
TypeRegistries.default.add("aicon.mouse", MouseDownCondition);
TypeRegistries.default.add("aicon.keydown", KeyDownCondition);

TypeRegistries.default.add("aicon.data", DataComparisonCondition);

TypeRegistries.default.add("aicon.all", CombinedCondition);
TypeRegistries.default.add("aicon.any", AlternativeCondition);

