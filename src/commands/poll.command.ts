import type { Context } from "grammy";
import type { BaseCommandType } from ".";
import { createInlineKeyboard } from "../callbacks";

const command: BaseCommandType = {
  name: "poll",
  aliases: ["vote", "survey"],
  description: "Create interactive polls with multiple options",
  category: "Social",
  cooldown: 10,
  parameters: [
    {
      name: "question",
      type: "string",
      required: true,
      description: "The poll question",
    },
    {
      name: "options",
      type: "string",
      required: true,
      description: "Poll options separated by semicolons (;)",
    },
    {
      name: "anonymous",
      type: "boolean",
      required: false,
      description: "Make the poll anonymous (true/false, default: false)",
    },
    {
      name: "multiple",
      type: "boolean",
      required: false,
      description: "Allow multiple answers (true/false, default: false)",
    },
  ],
  execute: async (context: Context, args?: Record<string, any>) => {
    try {
      const question = args?.question?.toString().trim();
      const optionsStr = args?.options?.toString().trim();
      const anonymous = args?.anonymous === true;
      const multipleChoice = args?.multiple === true;

      if (!question) {
        await context.reply(
          "❌ Please provide a poll question.\n\n" +
            "Usage: `/poll <question> <options> [anonymous] [multiple]`\n\n" +
            "Example:\n" +
            '`/poll "What\'s your favorite color?" "Red;Blue;Green;Yellow" false false`\n\n' +
            "Options should be separated by semicolons (;)",
          { parse_mode: "Markdown" },
        );
        return;
      }

      if (!optionsStr) {
        await context.reply(
          "❌ Please provide poll options separated by semicolons (;).\n\n" +
            "Example: `Red;Blue;Green;Yellow`",
          { parse_mode: "Markdown" },
        );
        return;
      }

      // Parse options
      const options = optionsStr
        .split(";")
        .map((opt: string) => opt.trim())
        .filter((opt: string) => opt.length > 0);

      if (options.length < 2) {
        await context.reply(
          "❌ Please provide at least 2 options separated by semicolons (;).\n\n" +
            "Example: `Red;Blue;Green;Yellow`",
        );
        return;
      }

      if (options.length > 10) {
        await context.reply("❌ Maximum 10 options allowed per poll.");
        return;
      }

      // Validate option lengths
      for (const option of options) {
        if (option.length > 100) {
          await context.reply("❌ Each option must be 100 characters or less.");
          return;
        }
      }

      if (question.length > 300) {
        await context.reply("❌ Poll question must be 300 characters or less.");
        return;
      }

      // Create Telegram native poll
      try {
        await context.replyWithPoll(question, options, {
          is_anonymous: anonymous,
          allows_multiple_answers: multipleChoice,
          protect_content: false,
        });

        // Send additional info about the poll
        const pollInfo =
          `📊 **Poll Created Successfully!**\n\n` +
          `❓ Question: ${question}\n` +
          `📝 Options: ${options.length}\n` +
          `👤 Anonymous: ${anonymous ? "Yes" : "No"}\n` +
          `☑️ Multiple Choice: ${multipleChoice ? "Yes" : "No"}\n\n` +
          `Vote above! 👆`;

        // Create management keyboard for poll creator
        const keyboard = createInlineKeyboard([
          [
            { text: "📊 Create Another Poll", action: "create_poll" },
            { text: "❓ Poll Help", action: "poll_help" },
          ],
        ]);

        await context.reply(pollInfo, {
          parse_mode: "Markdown",
          reply_markup: keyboard,
        });
      } catch (pollError) {
        console.error("Error creating poll:", pollError);
        await context.reply(
          "❌ Failed to create the poll. This might be due to:\n" +
            "• Too many options\n" +
            "• Invalid characters in question or options\n" +
            "• Network issues\n\n" +
            "Please try again with simpler text.",
        );
      }
    } catch (error) {
      console.error("Error in poll command:", error);
      await context.reply("❌ An error occurred while creating the poll.");
    }
  },
};

export default command;
