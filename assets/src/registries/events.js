import { Registries } from "../core/registry.js";

Registries.events.add("scrapper-warn", {
  components: [
    { type: "condition.time-passed", time: 36000 },
    {
      type: "action.message",
      text: "#7iThe rumbling of a rocket engine echoes through the sky...",
    },
  ],
});
Registries.events.add("scrapper-spawn", {
  components: [
    { type: "condition.time-passed", time: 46800 },
    { type: "condition.event", event: "scrapper-warn" },
    { type: "action.message", text: "#c-The Scrapper has descended!" },
    { type: "action.deliver", entity: "scrapper" },
  ],
});

Registries.events.add("iti-npc-spawn", {
  components: [
    { type: "condition.time-passed", time: 18000 },
    { type: "action.message", text: "#i-ITI have sent a merchant to trade" },
    {
      type: "action.deliver",
      entity: "iti-corporate-merchant",
      targetTeam: "scrap",
      targetHighValue: false,
    },
  ],
});
