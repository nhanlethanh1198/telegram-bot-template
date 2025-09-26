import { buildCommandList, type BaseCommandType } from ".";

const command: BaseCommandType = {
  name: "help",
  aliases: ["h"],
  description: "Display help information",
  execute: async (context) => {
    const commandList = buildCommandList();

    const msg =
      `Here is the list of available commands:\n\n` + commandList + "\n\n";

    await context.reply(msg);
  },
};

export default command;
