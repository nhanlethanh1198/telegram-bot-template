import type { Context } from "grammy";
import type { BaseCommandType } from ".";

const command: BaseCommandType = {
  name: "start",
  description: "Start the bot",
  execute: async (context: Context) => {
    await context.reply("Hello!");
  },
};

export default command;
