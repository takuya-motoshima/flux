#!/usr/bin/env node
//
// SubagentStart/Stop hook script.
// Logs agent lifecycle events to stdout (and optionally to a debug log file).
//
// stdin: JSON from Claude Code hook system
//   { hook_event_name: "SubagentStart"|"SubagentStop", agent_type: string, ... }
//
// stdout: "[DevFlow] <agent_type> started|finished"
//   Displayed to the user in the Claude Code UI.
//

// Set to true to enable file logging (writes to devflow-hook.log in cwd)
const DEBUG_LOG = false;

const fs = require("fs");
const path = require("path");
const logFile = path.join(process.cwd(), "devflow-hook.log");

function log(message) {
  if (DEBUG_LOG) {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
  }
}

// Read hook payload from stdin
let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  log(`raw: ${data}`);
  try {
    const input = JSON.parse(data);
    const event = input.hook_event_name === "SubagentStart" ? "started" : "finished";
    const msg = `[DevFlow] ${input.agent_type} ${event}`;
    log(msg);
    console.log(msg);
  } catch (e) {
    // JSON parse failure — log error, output fallback message
    log(`error: ${e.message}`);
    console.log("[DevFlow] agent event");
  }
});
