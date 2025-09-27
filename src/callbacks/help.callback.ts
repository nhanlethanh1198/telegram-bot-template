import type { Context } from "grammy";
import type { BaseCallbackType } from ".";
import { buildCommandList } from "../commands";

const callback: BaseCallbackType = {
  name: "help",
  description: "Show help information via callback",
  category: "General",
  execute: async (context: Context) => {
    const commandList = buildCommandList();
    const message = `🤖 **Bot Help**\n\nAvailable commands:${commandList}\n\n💡 Use \`/help <command>\` for detailed information about a specific command.`;

    await context.editMessageText(message, { parse_mode: "Markdown" });
    await context.answerCallbackQuery("Help information updated!");
  },
};

export default callback;
