import {
  buildCommandList,
  commands,
  generateCommandHelp,
  type BaseCommandType,
} from ".";
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
      const commandName = args.command.toLowerCase();
      const targetCommand = commands.find(
        (cmd) =>
          cmd.name === commandName ||
          (cmd.aliases && cmd.aliases.includes(commandName)),
      );

      if (targetCommand) {
        await context.reply(generateCommandHelp(targetCommand), {
          parse_mode: "Markdown",
        });
      } else {
        await context.reply(
          `❌ Command \`${commandName}\` not found.\n\n` +
            `Use \`/help\` to see all available commands.`,
          { parse_mode: "Markdown" },
        );
      }
    } else {
      // Show general help
      const commandList = buildCommandList();
      const msg = `🤖 **Bot Help**\n\nAvailable commands:${commandList}\n\n💡 **Quick Help Tips:**\n• Use \`/help <command>\` for detailed information about a specific command\n• Use \`/<command> --help\` for detailed usage of any command (e.g., \`/poll --help\`)`;

      await context.reply(msg, { parse_mode: "Markdown" });
    }
  },
};

export default command;
