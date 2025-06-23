import { Registries } from "../core/registry.js";
//[
// [environmental...],
// [direct...]
//]
Registries.deathmsg.add("ballistic", [
  ["(1) was shot", "(1) forgot to dodge", "(1) didn't move in time"],
  [
    "(1) was shot by (2)",
    "(1) was executed by (2)",
    "(1) tried to catch (2)'s bullet",
  ],
]);
Registries.deathmsg.add("laser", [
  [
    "(1) was shot",
    "(1) was lased to death",
    "(1) was laser-cut",
    "(1) thought they could dodge lasers",
  ],
  [
    "(1) was shot by (2)",
    "(1) was lased by (2)",
    "(1) was laser-cut by (2)",
    "(1) tried to dodge (2)'s laser",
  ],
]);
Registries.deathmsg.add("impact", [
  ["(1) was crushed to death", "(1) couldn't handle the pressure"],
  ["(1) was crushed by (2)", "(1) was squashed by (2)"],
]);
Registries.deathmsg.add("explosion", [
  ["(1) blew up", "(1) became geography", "(1) tried to rocket jump"],
  [
    "(1) was blown up by (2)",
    "(1)'s surface area was rapidly increased by (2)",
  ],
]);
Registries.deathmsg.add("fire", [
  [
    "(1) went up in flames",
    "(1) couldn't put the fire out",
    "(1) stopped and dropped", //forgot to roll
  ],
  [
    "(1) was incinerated by (2)",
    "(1) was burned to death by (2)",
    "(1) was a victim of (2)'s arson",
  ],
]);
Registries.deathmsg.add("electric", [
  [
    "(1) was electrocuted",
    "(1) ignored the high-voltage warning sign",
    "(1) couldn't handle current events",
  ],
  [
    "(1) was electrocuted by (2)",
    "(2)'s attempt to defibrillate (1) failed", //Don't let them do CPR
  ],
]);
Registries.deathmsg.add("no", [
  ["(1) stopped existing"],
  ["(1) stopped existing because of (2)"],
]);
Registries.deathmsg.add("power-off", [
  ["(1)'s power ran out", "(1) forgot to charge their battery", "(1) neglected the energy meter"],
  ["(1) ran out of power whilst fighting (2)"],
]);
Registries.deathmsg.add("system-error", [
  ["(1)'s system crashed", "(1) threw a syntax error", "(1)'s system corrupted", "(1) threw a type error"],
  [],
]);
Registries.deathmsg.add("insanity", [
  [
    "(1)'s inner demons escaped", //MY DEMONS NOOO
    "(1) embraced the darkness", //i am the night
    "(1) went insane", //uh oh
    "(1) stared too deep", //the abyss stares back
  ],
  [],
]);
//In a top-down, 2D game...
//FALL DAMAGE.
Registries.deathmsg.add("fall", [
  [
    "(1) invented gravity", //Hmmm yes f a l l
    "(1) stopped falling", //*b o n k*
    "(1) couldn't fly", //I believe i- [© has found you]
    "(1) missed the water", //mlg water bucket drop 360 no scope speed craft to bed- *cronch*
    "(1) found out what a one-person trust fall looks like",
  ],
  [
    "(1) was defenestrated by (2)", //Throw it out the window!
    "(1) was gravitationally assisted by (2)", //Assisted in falling off a building, you mean?
    "(1)'s trust in (2) was misplaced", //TRUST FALL
  ],
]);
