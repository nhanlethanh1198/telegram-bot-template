import { buildCommandList, type BaseCommandType } from ".";
import type { Context } from "grammy";

const command: BaseCommandType = {
  name: "help",
  aliases: ["h"],
  description: "Display help information",
  category: "General",
  parameters: [
    {
      name: "command",
      type: "string",
      required: false,
      description: "Get detailed help for a specific command",
    },
  ],
  execute: async (context: Context, args?: Record<string, any>) => {
    if (args?.command) {
      // Show detailed help for specific command
      await context.reply(
        `Detailed help for command: ${args.command}\n(Feature coming soon!)`,
      );
    } else {
      // Show general help
      const commandList = buildCommandList();
      const msg = `🤖 **Bot Help**\n\nAvailable commands:${commandList}\n\n💡 Use \`/help <command>\` for detailed information about a specific command.`;

      await context.reply(msg, { parse_mode: "Markdown" });
    }
  },
};

export default command;
