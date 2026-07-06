import { PreloadRegistries } from "../core/registry.js";
function add(n,i) { PreloadRegistries.images.add(n, { path: i }) };

add("error", "assets/textures/error.png")
add("error.cmft", "assets/textures/icon/cmft-error.png")

// screen
add("title.project", "assets/textures/screen/project.svg")
add("title.project.accent", "assets/textures/screen/project-yellow.svg")
add("icon.database.large", "assets/textures/screen/database.svg")
add("icon.database.complete", "assets/textures/screen/database-complete.svg")
//Icons
add("icon.chest", "assets/textures/icon/chest.png")
add("icon.cross", "assets/textures/icon/cross.png")
add("icon.interaction", "assets/textures/icon/interaction.png")
add("icon.question", "assets/textures/icon/question.png")
add("icon.selector", "assets/textures/icon/selector.png")
add("icon.arrow", "assets/textures/icon/arrow.png")
add("icon.home", "assets/textures/icon/home.png")
add("icon.bullet", "assets/textures/icon/bullet.png")
add("icon.iti", "assets/textures/icon/iti.png")
add("icon.peti", "assets/textures/icon/peti.png")
add("icon.ccc", "assets/textures/icon/ccc.png")
add("icon.scrap", "assets/textures/icon/scrap.png")
add("icon.adv", "assets/textures/icon/adv.png")
add("icon.dev", "assets/textures/icon/dev.png")
add("icon.int", "assets/textures/icon/integrate.png")
add("icon.reassembly", "assets/textures/icon/p-r.png")
add("icon.database", "assets/textures/icon/database.svg")
//Components
add("entity.scrap-sentinel.head", "assets/textures/entity/component/scrap-sentinel-head.png")
add("entity.scrap-sentinel.body", "assets/textures/entity/component/scrap-sentinel-body.png")
add("entity.scrap-sentinel.legs", "assets/textures/entity/component/scrap-sentinel-foot.png")

add("npc.iti.corporate-merchant.head", "assets/textures/entity/component/iti-corporate-merchant-head.png")
add("npc.iti.player.head", "assets/textures/entity/component/iti-player-head.png")
add("npc.iti.generic.body", "assets/textures/entity/component/iti-npc-body.png")
add("npc.iti.generic.legs", "assets/textures/entity/component/iti-npc-foot.png")

add("arm.scrap",  "assets/textures/entity/component/scrap-arm.png")
add("arm.iti",  "assets/textures/entity/component/iti-arm.png")
//Components > Weapons
add("weapon.scrap-shooter.component", "assets/textures/entity/weapon/scrap-shooter.png")
add("weapon.scrap-repeater.component", "assets/textures/entity/weapon/scrap-repeater.png")
add("weapon.scrap-launcher.component", "assets/textures/entity/weapon/scrap-launcher.png")
add("weapon.construction-gun.component", "assets/textures/entity/weapon/construction-gun.png")
add("weapon.tank-gun.component", "assets/textures/entity/weapon/tank-gun.png")

add("weapon.iti-laser-pistol.component", "assets/textures/entity/weapon/iti-laser-pistol.png")
add("weapon.iti-laser-caster.component", "assets/textures/entity/weapon/iti-laser-caster.png")
add("weapon.iti-energy-repeater.component", "assets/textures/entity/weapon/iti-energy-repeater.png")

add("weapon.peti-charged-laser-blaster.component", "assets/textures/entity/weapon/peti-charged-laser-blaster.png")
add("weapon.peti-plasma-railgun.component", "assets/textures/entity/weapon/peti-plasma-railgun.png")
add("weapon.peti-remote-railgun.component", "assets/textures/entity/weapon/peti-remote-railgun.png")
//Components > Weapons > Melee
add("weapon.slicer.component", "assets/textures/entity/weapon/slicer.png")
//Components > Turrets
add("turret.recycle.component", "assets/textures/block/turret/recycle.png")
add("turret.deathbringer.component", "assets/textures/block/turret/deathbringer.png")
//Items
add("item.raw-copper", "assets/textures/item/raw-copper.png")
add("item.copper-ingot", "assets/textures/item/copper-ingot.png")
add("item.copper-wire", "assets/textures/item/copper-wire.png")

add("item.raw-iron", "assets/textures/item/raw-iron.png")
add("item.iron-ingot", "assets/textures/item/iron-ingot.png")

add("item.raw-electrum", "assets/textures/item/raw-electrum.png")
add("item.electrum-ingot", "assets/textures/item/electrum-ingot.png")
add("item.silver-ingot", "assets/textures/item/silver-ingot.png")
add("item.gold-ingot", "assets/textures/item/gold-ingot.png")
add("item.gold-wire", "assets/textures/item/gold-wire.png")

add("item.raw-titanium", "assets/textures/item/raw-titanium.png")
add("item.titanium-ingot", "assets/textures/item/titanium-ingot.png")

add("item.raw-aluminium", "assets/textures/item/raw-aluminium.png")
add("item.aluminium-ingot", "assets/textures/item/aluminium-ingot.png")

add("item.raw-tungsten", "assets/textures/item/raw-tungsten.png")
add("item.tungsten-ingot", "assets/textures/item/tungsten-ingot.png")

add("item.scrap", "assets/textures/item/scrap.png")
add("item.plate", "assets/textures/item/plate.png")

add("item.stone", "assets/textures/item/stone.png")

add("item.sand", "assets/textures/item/sand.png")
add("item.sandstone", "assets/textures/item/sandstone.png")

add("item.coal", "assets/textures/item/coal.png")
add("item.makeshift-explosive", "assets/textures/item/makeshift-explosive.png")
//Items > Accessories
add("accessory.blast-knuckles", "assets/textures/item/blast-knuckles.png")
//Items > Ammo
add("item.scrap-bullet", "assets/textures/item/scrap-bullet.png")
add("item.scrap-rocket", "assets/textures/item/scrap-rocket.png")
add("item.iti-energy-cell", "assets/textures/item/iti-energy-cell.png")
add("item.iti-plasma-cell", "assets/textures/item/iti-plasma-cell.png")
add("item.iti-destabilised-cell", "assets/textures/item/iti-destabilised-cell.png")
//Items > Weapons
add("weapon.scrap-shooter.item", "assets/textures/item/scrap-shooter.png")
add("weapon.scrap-repeater.item", "assets/textures/item/scrap-repeater.png")
add("weapon.scrap-launcher.item", "assets/textures/item/scrap-launcher.png")
add("weapon.construction-gun.item", "assets/textures/item/construction-gun.png")
add("weapon.tank-gun.item", "assets/textures/item/tank-gun.png")

add("weapon.iti-laser-pistol.item", "assets/textures/item/iti-laser-pistol.png")
add("weapon.iti-laser-caster.item", "assets/textures/item/iti-laser-caster.png")
add("weapon.iti-energy-repeater.item", "assets/textures/item/iti-energy-repeater.png")

add("weapon.peti-charged-laser-blaster.item", "assets/textures/item/peti-charged-laser-blaster.png")
add("weapon.peti-plasma-railgun.item", "assets/textures/item/peti-plasma-railgun.png")
add("weapon.peti-remote-railgun.item", "assets/textures/item/peti-remote-railgun.png")
//Items > Weapons > Melee
add("weapon.slicer.item", "assets/textures/item/slicer.png")
//boolet
add("bullet.scrap-rocket", "assets/textures/bullet/scrap-rocket.png")
//Items > Turrets
add("turret.deathbringer.item", "assets/textures/item/deathbringer-turret.png")
//Tiles
add("tile.grass", "assets/textures/block/tile/grass.png")
add("tile.sand", "assets/textures/block/tile/sand.png")
add("tile.stone", "assets/textures/block/tile/stone.png")
add("tile.water", "assets/textures/block/tile/water.png")
add("tile.deep-water", "assets/textures/block/tile/deep-water.png")
add("tile.sand-water", "assets/textures/block/tile/sand-water.png")
add("tile.sand-grass", "assets/textures/block/tile/sandy-grass.png")
//Ores
add("ore.copper", "assets/textures/block/ore/copper-ore.png")
add("ore.copper.exposed", "assets/textures/block/ore/copper-ore-exposed.png")
add("ore.copper.weathered", "assets/textures/block/ore/copper-ore-weathered.png")
add("ore.copper.oxidised", "assets/textures/block/ore/copper-ore-oxidised.png")

add("ore.iron", "assets/textures/block/ore/iron-ore.png")
add("ore.coal", "assets/textures/block/ore/coal-ore.png")
add("ore.electrum", "assets/textures/block/ore/electrum-ore.png")
//Blocks
add("base.scrap", "assets/textures/block/blocks/scrap-block-base.png")
add("base.scrap.smooth", "assets/textures/block/blocks/smooth-scrap-block-base.png")
add("base.basic", "assets/textures/block/blocks/basic-block-base.png")
add("base.copper", "assets/textures/block/blocks/copper-block-base.png")
add("base.iron", "assets/textures/block/blocks/iron-block-base.png")
add("base.titanium", "assets/textures/block/blocks/titanium-block-base.png")
add("base.tungsten", "assets/textures/block/blocks/tungsten-block-base.png")
//Blocks > Dev
add("block.dev.structurereader", "assets/textures/block/blocks/dev/structure-reader.png")
add("block.dev.itemcatalog", "assets/textures/block/blocks/dev/item-catalog.png")
add("block.dev.commandblock", "assets/textures/block/blocks/dev/command-block.png")
add("block.dev.commandblock.chain", "assets/textures/block/blocks/dev/command-block-chain.png")
add("block.dev.commandblock.loop", "assets/textures/block/blocks/dev/command-block-repeat.png")
add("block.dev.commandblock.heat", "assets/textures/block/blocks/dev/command-block-heat.png")
//Blocks > Defense
add("block.stone-wall", "assets/textures/block/blocks/defense/stone-wall.png")
add("block.sandstone-wall", "assets/textures/block/blocks/defense/sandstone-wall.png")
//Blocks > Turrets
add("turret-base.scrap.connector", "assets/textures/block/turret/bases/scrap-connector.png")
add("turret-controller.scrap.base", "assets/textures/block/turret/bases/scrap-turret-controller.png")
add("turret-base.peti.connector", "assets/textures/block/turret/bases/peti-connector.png")
add("turret-base.peti.base", "assets/textures/block/turret/bases/peti-turret-base.png")
add("turret-controller.peti.base", "assets/textures/block/turret/bases/peti-turret-controller.png")
//Blocks > Crafters
add("crafter.scrap-assembler", "assets/textures/block/blocks/crafter/scrap-assembler.png")
add("crafter.scrap-smelter", "assets/textures/block/blocks/crafter/scrap-smelter.png")
add("crafter.scrap-disassembler", "assets/textures/block/blocks/crafter/scrap-disassembler.png")
add("crafter.scrap-compressor", "assets/textures/block/blocks/crafter/scrap-compressor.png")
//Blocks > Drills
add("drill.scrap-drill.top", "assets/textures/block/blocks/drill/scrap-drill-top.png")
add("drill.scrap-drill.spinner", "assets/textures/block/blocks/drill/scrap-drill-spinner.png")
add("drill.scrap-drill.base", "assets/textures/block/blocks/drill/scrap-drill-base.png")
add("drill.scrap-drill.ui", "assets/textures/block/blocks/drill/scrap-drill.png")

add("drill.basic-drill.top", "assets/textures/block/blocks/drill/basic-drill-top.png")
add("drill.basic-drill.spinner", "assets/textures/block/blocks/drill/basic-drill-spinner.png")
add("drill.basic-drill.base", "assets/textures/block/blocks/drill/basic-drill-base.png")
add("drill.basic-drill.ui", "assets/textures/block/blocks/drill/basic-drill.png")
//Blocks > Conveyors
add("conveyor.scrap-conveyor.belt", "assets/textures/block/blocks/conveyor/scrap-conveyor-belt.png")
add("conveyor.scrap-conveyor.ui", "assets/textures/block/blocks/conveyor/scrap-conveyor.png")
add("conveyor.scrap-unloader.belt", "assets/textures/block/blocks/conveyor/scrap-unloader-belt.png")
add("conveyor.scrap-unloader.ui", "assets/textures/block/blocks/conveyor/scrap-unloader.png")

add("conveyor.basic-conveyor.belt", "assets/textures/block/blocks/conveyor/basic-conveyor-belt.png")
add("conveyor.basic-conveyor.ui", "assets/textures/block/blocks/conveyor/basic-conveyor.png")
add("conveyor.basic-unloader.belt", "assets/textures/block/blocks/conveyor/basic-unloader-belt.png")
add("conveyor.basic-unloader.ui", "assets/textures/block/blocks/conveyor/basic-unloader.png")
//Blocks > Plasma
add("ppipe.plasma-pipeline.ui", "assets/textures/block/blocks/plasma/plasma-pipeline-ui.png")
add("ppipe.plasma-pipeline.base", "assets/textures/block/blocks/plasma/plasma-pipeline-base.png")
add("ppipe.plasma-pipeline.input", "assets/textures/block/blocks/plasma/plasma-pipeline-input.png")
add("ppipe.plasma-pipeline.output", "assets/textures/block/blocks/plasma/plasma-pipeline-output.png")
add("ppipe.plasma-pipeline.base-plasma", "assets/textures/block/blocks/plasma/plasma-pipeline-base-plasma.png")
add("ppipe.plasma-pipeline.input-plasma", "assets/textures/block/blocks/plasma/plasma-pipeline-input-plasma.png")
add("ppipe.plasma-pipeline.output-plasma", "assets/textures/block/blocks/plasma/plasma-pipeline-output-plasma.png")

add("ppipe.plasma-compressor.ui", "assets/textures/block/blocks/plasma/compressor/plasma-compressor-ui.png")
add("ppipe.plasma-compressor.base", "assets/textures/block/blocks/plasma/compressor/plasma-compressor-base.png")
add("ppipe.plasma-compressor.input", "assets/textures/block/blocks/plasma/compressor/plasma-compressor-input.png")
add("ppipe.plasma-compressor.output", "assets/textures/block/blocks/plasma/compressor/plasma-compressor-output.png")
add("ppipe.plasma-compressor.base-plasma", "assets/textures/block/blocks/plasma/compressor/plasma-compressor-base-plasma.png")
add("ppipe.plasma-compressor.input-plasma", "assets/textures/block/blocks/plasma/compressor/plasma-compressor-input-plasma.png")
add("ppipe.plasma-compressor.output-plasma", "assets/textures/block/blocks/plasma/compressor/plasma-compressor-output-plasma.png")
add("ppipe.plasma-compressor.spinner", "assets/textures/block/blocks/plasma/compressor/plasma-compressor-spinner.png")

add("tank.plasma-tank.base", "assets/textures/block/blocks/plasma/plasma-tank.png")
add("tank.plasma-tank.plasma", "assets/textures/block/blocks/plasma/plasma-tank-plasma.png")
//Blocks > Decoration
add("block.message", "assets/textures/block/blocks/deco/message.png")
//Blocks > Capitalism
add("capitalism.iti.launch", "assets/textures/block/blocks/capitalism/iti-launch-pad.png")
add("capitalism.iti.land", "assets/textures/block/blocks/capitalism/iti-landing-pad.png")
add("capitalism.iti.pod", "assets/textures/block/blocks/capitalism/iti-pod.png")
//Blocks > Offense
add("bomb.basic", "assets/textures/block/blocks/defense/bomb-block.png")
add("bomb.landmine", "assets/textures/block/blocks/defense/landmine.png")
add("bomb.landmine.hidden", "assets/textures/block/blocks/defense/landmine-hidden.png")
add("bomb.landmine.item", "assets/textures/block/blocks/defense/landmine-item.png")
