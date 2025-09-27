import type { Context } from "grammy";
import type { BaseCallbackType } from ".";

const callback: BaseCallbackType = {
  name: "create_poll",
  description: "Interactive poll creation guide",
  category: "Social",
  execute: async (context: Context) => {
    const pollGuide = `📊 **Create a New Poll**

To create a poll, use the /poll command with this format:

\`/poll "<question>" "<option1;option2;option3>" [anonymous] [multiple]\`

**Examples:**
• \`/poll "What's your favorite color?" "Red;Blue;Green;Yellow"\`
• \`/poll "Best programming language?" "JavaScript;Python;TypeScript;Go" false true\`
• \`/poll "Should we have pizza tonight?" "Yes;No;Maybe" true false\`

**Parameters:**
📝 **Question** - Your poll question (max 300 chars)
📋 **Options** - Separate options with semicolons (;)
👤 **Anonymous** - true/false (default: false)
☑️ **Multiple** - Allow multiple answers (default: false)

**Tips:**
• Use 2-10 options maximum
• Keep options under 100 characters
• Use clear, concise language
• Test with simple polls first

Ready to create your poll? Just type the /poll command!`;

    await context.editMessageText(pollGuide, { parse_mode: "Markdown" });
    await context.answerCallbackQuery("Poll creation guide loaded!");
  },
};

export default callback;
