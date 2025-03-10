//Basic
Registry.type.add("generic", RegisteredItem)
//Entities and parts
Registry.type.add("component", Component)
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
Registry.type.add("item", Item)
Registry.type.add("placeable", PlaceableItem)
Registry.type.add("itemstack", ItemStack)
Registry.type.add("equippable", Equippable)
Registry.type.add("weapon", Weapon)
//World
Registry.type.add("world", World)
Registry.type.add("chunk", Chunk)
Registry.type.add("generator", Generator)
Registry.type.add("tile-generator", TileGenerator)

Registry.type.add("gen-options", TileGenerationOptions)
Registry.type.add("tile-gen-options", TileGenerationOptions)
//Block
Registry.type.add("block", Block)
Registry.type.add("tile", Tile)
Registry.type.add("container", Container)
Registry.type.add("crafter", Crafter)
Registry.type.add("uncrafter", Uncrafter)
Registry.type.add("tile-producer", TileProducer)
Registry.type.add("drill", Drill)
Registry.type.add("conveyor", Conveyor)
Registry.type.add("unloader", Unloader)