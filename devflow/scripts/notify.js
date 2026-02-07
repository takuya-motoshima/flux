#!/usr/bin/env node
let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(data);
    const event = input.hook_event_name === "SubagentStart" ? "started" : "finished";
    console.log(`[DevFlow] ${input.agent_type} ${event}`);
  } catch {
    console.log("[DevFlow] agent event");
  }
});
