import {
  AddFlagAction,
  AddGlobalFlagAction,
  AddItemToInventoryAction,
  AddTradeToMenuAction,
  ChangeRelationAction,
  ChangeRelationWithAction,
  CloseDialogueMenuAction,
  DeliverEntityAction,
  DemoteFromBestFriendAction,
  DemoteFromMortalEnemyAction,
  DialogueAction,
  FuckOffAction,
  OpenTradingMenuAction,
  PlaceholderTextDialogueAction,
  PromoteToBestFriendAction,
  PromoteToMortalEnemyAction,
  RemoveFlagAction,
  RemoveGlobalFlagAction,
  RemoveTradeFromMenuAction,
  RepeatedAction,
} from "../../classes/interaction/actions.js";
import { TypeRegistries } from "../../core/registry.js";

TypeRegistries.dialogue.add("no-op", DialogueAction);
TypeRegistries.dialogue.add("ph-text", PlaceholderTextDialogueAction);
TypeRegistries.dialogue.add("change-relation", ChangeRelationAction);
TypeRegistries.dialogue.add("change-relation-with", ChangeRelationWithAction);
TypeRegistries.dialogue.add("flag", AddFlagAction);
TypeRegistries.dialogue.add("unflag", RemoveFlagAction);
TypeRegistries.dialogue.add("global-flag", AddGlobalFlagAction);
TypeRegistries.dialogue.add("global-unflag", RemoveGlobalFlagAction);
TypeRegistries.dialogue.add("best-friend", PromoteToBestFriendAction);
TypeRegistries.dialogue.add("mortal-enemy", PromoteToMortalEnemyAction);
TypeRegistries.dialogue.add("remove-best-friend", DemoteFromBestFriendAction);
TypeRegistries.dialogue.add("remove-mortal-enemy", DemoteFromMortalEnemyAction);
TypeRegistries.dialogue.add("trade", OpenTradingMenuAction);
TypeRegistries.dialogue.add("add-trade", AddTradeToMenuAction);
TypeRegistries.dialogue.add("remove-trade", RemoveTradeFromMenuAction);
TypeRegistries.dialogue.add("give-item", AddItemToInventoryAction);
TypeRegistries.dialogue.add("repeat", RepeatedAction);
TypeRegistries.dialogue.add("close", CloseDialogueMenuAction);
TypeRegistries.dialogue.add("leave", FuckOffAction);
TypeRegistries.dialogue.add("deliver", DeliverEntityAction);
