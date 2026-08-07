import {
  DamageTakenTrigger,
  DeathTrigger,
  FlagAddedTrigger,
  FlagRemovedTrigger,
  HealedTrigger,
  HealthPercentTrigger,
  HitByBulletTrigger,
  KillTrigger,
  ReactionTrigger,
  ShieldBrokenTrigger,
  StatusAppliedTrigger,
  TargetDiedTrigger,
} from "../../classes/interaction/triggers.js";
import { TypeRegistries } from "../../core/registry.js";

TypeRegistries.reactions.add("impossible", ReactionTrigger);
TypeRegistries.reactions.add("damage", DamageTakenTrigger);
TypeRegistries.reactions.add("health", HealthPercentTrigger);
TypeRegistries.reactions.add("death", DeathTrigger);
TypeRegistries.reactions.add("kill", KillTrigger);
TypeRegistries.reactions.add("target-died", TargetDiedTrigger);
TypeRegistries.reactions.add("status", StatusAppliedTrigger);
TypeRegistries.reactions.add("shield-broken", ShieldBrokenTrigger);
TypeRegistries.reactions.add("shot", HitByBulletTrigger);
TypeRegistries.reactions.add("healed", HealedTrigger);

TypeRegistries.reactions.add("flag", FlagAddedTrigger);
TypeRegistries.reactions.add("unflag", FlagRemovedTrigger);
