import {
  BulletComponent,
  BulletTraceComponent,
  CollisionFilterComponent,
  DamageComponent,
  DamagePierceComponent,
  DisableDefaultVFXComponent,
  ExpiryVFXComponent,
  ExplosionComponent,
  ExtraUpdatesComponent,
  FollowSetPathComponent,
  FragBulletComponent,
  HitBulletComponent,
  HitExplosionComponent,
  HitVFXComponent,
  ImageDrawerComponent,
  IncendiaryComponent,
  InfinitePierceComponent,
  InstantKnockbackComponent,
  InstantMovementComponent,
  IntervalBulletComponent,
  KillVFXComponent,
  KnockbackComponent,
  LinearVFXTraceComponent,
  MOABAdventureTrailComponent,
  MovementComponent,
  NoBlockCollisionComponent,
  NoEntityCollisionComponent,
  NuclearExplosionComponent,
  OldTrailComponent,
  ParticleTrailComponent,
  PierceComponent,
  ShapeDrawerComponent,
  SpawnBulletComponent,
  SpawnVFXComponent,
  StatusInflictionComponent,
  TrackNearestComponent,
  TrackNearSourceTargetComponent,
  TrackSourceTargetComponent,
  VFXTrailComponent,
} from "../../classes/projectile/bullet-components.js";
import { TypeRegistries } from "../../core/registry.js";

// Does nothing (except lag the game, i guess)
TypeRegistries.bullet.add("null", BulletComponent);

// Makes a bullet update more than once per tick.
TypeRegistries.bullet.add("extra-updates", ExtraUpdatesComponent);

// Makes the bullet move in the direction it's facing.
TypeRegistries.bullet.add("movement", MovementComponent);
// Makes the bullet trace a set of steps - overrides other movement components
TypeRegistries.bullet.add("follow-set-path", FollowSetPathComponent);
// Makes the bullet teleport in the direction it's facing and then despawn.
// Always teleports just far enough to hit the target, but angular inaccuracy will still apply
TypeRegistries.bullet.add("instant-movement", InstantMovementComponent);

// Turns to face the nearest enemy entity (that it can, and that it hasn't already hit)
TypeRegistries.bullet.add("track-nearest", TrackNearestComponent);
// Tracks the source entity's target - ignores filters
TypeRegistries.bullet.add("track-source-target", TrackSourceTargetComponent);
// Turns to face the nearest enemy entity to the source entity's target (that it can, and that it hasn't already hit)
TypeRegistries.bullet.add("track-near-source-target", TrackNearSourceTargetComponent);

// Spawns a trail of particles behind the bullet as it travels.
TypeRegistries.bullet.add("trail", ParticleTrailComponent);
// Spawns a trail made of a visual effect behind the bullet as it travels.
TypeRegistries.bullet.add("vfx-trail", VFXTrailComponent);
// Spawns a trail of particles behind the bullet as it travels.
// Behaves like trails did in older versions (before version 0.0.0-pre98-js)
TypeRegistries.bullet.add("old-trail", OldTrailComponent);
// Spawns a trail of particles behind the bullet as it travels.
// Behaves like MOAB Adventure trails (my other game, https://moab-adventure.github.io/play)
TypeRegistries.bullet.add("moab-adventure-trail", MOABAdventureTrailComponent);

// Deals damage to entities and blocks that the bullet hits.
TypeRegistries.bullet.add("damage", DamageComponent);
// Stops the bullet despawning when it hits an object a certain number of times.
TypeRegistries.bullet.add("pierce", PierceComponent);
// Deals damage to entities and blocks that the bullet hits. Reduces the damage left
// by the damage the bullet dealt to the object.
// Stops the bullet despawning if it still has damage remaining.
TypeRegistries.bullet.add("damage-pierce", DamagePierceComponent);
// Stops the bullet despawning when it hits an object.
TypeRegistries.bullet.add("infinite-pierce", InfinitePierceComponent);

// Creates an AoE damaging effect when the bullet expires.
TypeRegistries.bullet.add("explosion", ExplosionComponent);
// Creates an AoE damaging effect when the bullet hits something.
TypeRegistries.bullet.add("hit-explosion", HitExplosionComponent);
// Creates an AoE damaging effect when the bullet expires, 
// but makes it behave more like a real-life nuclear explosion.
TypeRegistries.bullet.add("nuclear-explosion", NuclearExplosionComponent);
// Applies a status effect to hit entities.
TypeRegistries.bullet.add("status-infliction", StatusInflictionComponent);
// Applies velocity to entities that the bullet hits.
TypeRegistries.bullet.add("knockback", KnockbackComponent);
// Moves entities the bullet hits a set distance in the direction of the bullet.
TypeRegistries.bullet.add("instant-knockback", InstantKnockbackComponent);

// Draws an image at the bullet's position.
TypeRegistries.bullet.add("image-drawer", ImageDrawerComponent);
// Draws a shape at the bullet's position.
TypeRegistries.bullet.add("shape-drawer", ShapeDrawerComponent);

// When the bullet expires, traces its path with a linear visual effect.
TypeRegistries.bullet.add("line-trace", LinearVFXTraceComponent);
// Creates a visual effect when the bullet hits something.
TypeRegistries.bullet.add("hit-vfx", HitVFXComponent);
// Creates a visual effect when the bullet expires.
TypeRegistries.bullet.add("expiry-vfx", ExpiryVFXComponent);
// Creates a visual effect when the bullet destroys something.
TypeRegistries.bullet.add("kill-vfx", KillVFXComponent);
// Creates a visual effect when the bullet first ticks.
TypeRegistries.bullet.add("spawn-vfx", SpawnVFXComponent);

// Stops the bullet model creating default expiry effects.
TypeRegistries.bullet.add("disable-default-vfx", DisableDefaultVFXComponent);

// When the bullet expires, create another bullet which follows the same path as the original.
TypeRegistries.bullet.add("bullet-trace", BulletTraceComponent);

// When the bullet expires, emits some bullets.
TypeRegistries.bullet.add("frag-bullet", FragBulletComponent);
// When the bullet hits something, emits some bullets.
TypeRegistries.bullet.add("hit-bullet", HitBulletComponent);
//Every so many frames, emits some bullets.
TypeRegistries.bullet.add("interval-bullet", IntervalBulletComponent);
// When the bullet first spawns, emits some bullets.
TypeRegistries.bullet.add("spawn-bullet", SpawnBulletComponent);
// When the bullet kills something, emits some bullets.
TypeRegistries.bullet.add("kill-bullet", FragBulletComponent);
// When the bullet expires, spawns fire.
TypeRegistries.bullet.add("incendiary", IncendiaryComponent);

// Stops the bullet colliding with entities.
TypeRegistries.bullet.add("no-entity-collision", NoEntityCollisionComponent);
// Stops the bullet colliding with blocks.
TypeRegistries.bullet.add("no-block-collision", NoBlockCollisionComponent);
// Allows only certain objects to be hit by this bullet.
TypeRegistries.bullet.add("collision-filter", CollisionFilterComponent);

// TODO: Implement this for every existing weapon in the game
// All these classes work (hopefully) as intended, so focus
// on replacing old code with this.

// Maybe after that add an accessory modifier which adds 
// components to bullets (easy extra damage, pierce or explosions)
// and maybe add some accessories which do that