//Basic
Registry.type.add("generic", RegisteredItem);
//Entities and parts
Registry.type.add("component", Component);
Registry.type.add("leg-component", LegComponent);
Registry.type.add("weapon-component", WeaponComponent);
Registry.type.add("entity", Entity);
Registry.type.add("inventory-entity", InventoryEntity);
Registry.type.add("equipped-entity", EquippedEntity);
Registry.type.add("player", Player);
//Projectiles
Registry.type.add("bullet", Bullet);
Registry.type.add("laser", LaserBullet);
Registry.type.add("continuous-laser", ContinuousLaserBullet);
Registry.type.add("missile", Missile);
Registry.type.add("critical", CriticalBullet);
Registry.type.add("point-bullet", PointBullet);
//Items
Registry.type.add("item", Item);
Registry.type.add("placeable", PlaceableItem);
Registry.type.add("itemstack", ItemStack);
Registry.type.add("equippable", Equippable);
Registry.type.add("weapon", Weapon);
//World
Registry.type.add("world", World);
Registry.type.add("chunk", Chunk);
Registry.type.add("generator", Generator);
Registry.type.add("tile-generator", TileGenerator);
Registry.type.add("ore-generator", OreGenerator);
Registry.type.add("block-generator", BlockGenerator);

Registry.type.add("gen-options", GenerationOptions);
Registry.type.add("tile-gen-options", TileGenerationOptions);
Registry.type.add("ore-gen-options", OreGenerationOptions);
//Block
Registry.type.add("block", Block);
Registry.type.add("tile", Tile);
Registry.type.add("ore", Ore);
Registry.type.add("container", Container);
Registry.type.add("crafter", Crafter);
Registry.type.add("smelter", Smelter);
Registry.type.add("uncrafter", Uncrafter);
Registry.type.add("tile-producer", TileProducer);
Registry.type.add("drill", Drill);
Registry.type.add("conveyor", Conveyor);
Registry.type.add("unloader", Unloader);
Registry.type.add("sign", SignBlock);
//Dev blocks
Registry.type.add("dev::structurereader", StructureReaderBlock);
Registry.type.add("dev::itemcatalog", ItemCatalogBlock);
Registry.type.add("dev::commandblock", CommandExecutorBlock);
//Effects
Registry.type.add("visual-effect", VisualEffect);
Registry.type.add("particle-emission", ParticleEmissionEffect);
Registry.type.add("image-particle-emission", ImageParticleEmissionEffect);
Registry.type.add("text-particle-emission", TextParticleEmissionEffect);
Registry.type.add("wave-emission", WaveEmissionEffect);
Registry.type.add("multi-effect", MultiEffect);
Registry.type.add("explosion", ExplosionEffect);
Registry.type.add("nuclear-explosion", NuclearExplosionEffect);
