import type { BaseCommandType } from ".";

const command: BaseCommandType = {
  name: "whatime",
  aliases: ["time", "wt"],
  description: "Display current time",

  execute: async (context) => {
    const time = new Date().toLocaleTimeString();
    await context.reply(`Current time: ${time}`);
  },
};

export default command;
