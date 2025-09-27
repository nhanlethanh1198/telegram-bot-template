import type { Context } from "grammy";
import type { BaseCallbackType } from ".";
import { createInlineKeyboard } from ".";

const callback: BaseCallbackType = {
  name: "back_to_start",
  description: "Return to the main start menu",
  category: "Navigation",
  execute: async (context: Context) => {
    const welcomeMessage = `🤖 **Welcome to the Bot!**

Hello ${context.from?.first_name || "there"}! I'm your enhanced Telegram bot with dynamic commands and interactive features.

🚀 **What I can do:**
• Execute commands with parameters
• Handle interactive buttons
• Support admin-only features
• Cooldown management
• And much more!

Use /help to see all available commands.`;

    const keyboard = createInlineKeyboard([
      [
        { text: "📚 Help", action: "help" },
        { text: "⏰ What Time", action: "time" },
      ],
      [
        {
          text: "🎲 Random Number",
          action: "random",
          data: { min: 1, max: 100 },
        },
      ],
    ]);

    await context.editMessageText(welcomeMessage, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });

    await context.answerCallbackQuery("Welcome back to the main menu!");
  },
};

export default callback;
