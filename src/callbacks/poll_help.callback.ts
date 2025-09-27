import type { Context } from "grammy";
import type { BaseCallbackType } from ".";
import { createInlineKeyboard } from ".";

const callback: BaseCallbackType = {
  name: "poll_help",
  description: "Comprehensive poll help and tips",
  category: "Social",
  execute: async (context: Context) => {
    const helpMessage = `📊 **Poll Help & Tips**

**Basic Usage:**
\`/poll "<question>" "<options>"\`

**Advanced Usage:**
\`/poll "<question>" "<options>" <anonymous> <multiple>\`

**📋 Option Formatting:**
• Separate options with semicolons (;)
• Example: "Red;Blue;Green;Yellow"
• 2-10 options maximum
• Each option max 100 characters

**🎯 Parameters:**
• **Anonymous**: true/false - Hide voter identities
• **Multiple**: true/false - Allow multiple selections

**✨ Examples:**

**Simple Poll:**
\`/poll "Favorite season?" "Spring;Summer;Fall;Winter"\`

**Anonymous Poll:**
\`/poll "Rate the meeting" "Excellent;Good;Fair;Poor" true false\`

**Multiple Choice:**
\`/poll "Which skills do you have?" "JavaScript;Python;React;Node.js" false true\`

**🏆 Best Practices:**
• Keep questions clear and specific
• Use neutral language
• Avoid leading questions
• Test controversial topics as anonymous
• Limit options to avoid choice overload

**⚠️ Limitations:**
• Question max 300 characters
• Option max 100 characters each
• Max 10 options per poll
• Polls cannot be edited after creation

Need more help? Try creating a simple poll first!`;

    const keyboard = createInlineKeyboard([
      [
        { text: "📊 Create Poll", action: "create_poll" },
        { text: "🔙 Back", action: "back_to_start" },
      ],
    ]);

    await context.editMessageText(helpMessage, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });

    await context.answerCallbackQuery("Poll help information loaded!");
  },
};

export default callback;
