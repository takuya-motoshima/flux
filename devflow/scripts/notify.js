#!/usr/bin/env node
//
// SubagentStart/Stop hook script.
// Logs agent lifecycle events to stdout and a debug log file.
//
// stdin: JSON from Claude Code hook system
//   { hook_event_name: "SubagentStart"|"SubagentStop", agent_type: string, ... }
//
// stdout: "[DevFlow] <agent_type> started|finished"
//   Displayed to the user in the Claude Code UI.
//
const fs = require("fs");
const path = require("path");
const logFile = path.join(process.cwd(), "devflow-hook.log");

// Read hook payload from stdin
let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  // Write raw payload for debugging
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] raw: ${data}\n`);
  try {
    const input = JSON.parse(data);
    const event = input.hook_event_name === "SubagentStart" ? "started" : "finished";
    const msg = `[DevFlow] ${input.agent_type} ${event}`;
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
    console.log(msg);
  } catch (e) {
    // JSON parse failure — log error, output fallback message
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] error: ${e.message}\n`);
    console.log("[DevFlow] agent event");
  }
});
