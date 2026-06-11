import { DeliverEntityAction, MessageAction, WorldEventAction } from "../../classes/world/events/event-action.js";
import { OtherEventHappenedCondition, TimedCondition, WorldEventCondition } from "../../classes/world/events/event-condition.js";
import { TypeRegistries } from "../../core/registry.js";

TypeRegistries.worldevent.add("action.none", WorldEventAction);
TypeRegistries.worldevent.add("action.deliver", DeliverEntityAction);
TypeRegistries.worldevent.add("action.message", MessageAction);
TypeRegistries.worldevent.add("condition.never", WorldEventCondition);
TypeRegistries.worldevent.add("condition.time-passed", TimedCondition);
TypeRegistries.worldevent.add("condition.event", OtherEventHappenedCondition);