import type { Context } from "grammy";
import type { BaseCallbackType } from ".";
import { createInlineKeyboard } from ".";

const callback: BaseCallbackType = {
  name: "random",
  description: "Generate random numbers with customizable range",
  category: "Utility",
  cooldown: 2, // 2 seconds cooldown
  parameters: [
    {
      name: "min",
      type: "number",
      required: false,
      description: "Minimum value (default: 1)",
    },
    {
      name: "max",
      type: "number",
      required: false,
      description: "Maximum value (default: 100)",
    },
    {
      name: "count",
      type: "number",
      required: false,
      description: "Number of random numbers to generate (default: 1, max: 10)",
    },
  ],
  execute: async (context: Context, data?: Record<string, any>) => {
    try {
      const min = Math.max(1, data?.min || 1);
      const max = Math.min(1000000, data?.max || 100);
      const count = Math.min(10, Math.max(1, data?.count || 1));

      if (min >= max) {
        await context.answerCallbackQuery(
          "Minimum value must be less than maximum value!",
        );
        return;
      }

      const randomNumbers: number[] = [];
      for (let i = 0; i < count; i++) {
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        randomNumbers.push(randomNum);
      }

      const numbersList =
        randomNumbers.length > 1
          ? randomNumbers.map((num, index) => `${index + 1}. ${num}`).join("\n")
          : (randomNumbers[0] || 0).toString();

      const message =
        count === 1
          ? `🎲 **Random Number Generated**\n\n` +
            `🔢 Number: **${numbersList}**\n` +
            `📊 Range: ${min} - ${max}`
          : `🎲 **Random Numbers Generated**\n\n` +
            `🔢 Numbers:\n${numbersList}\n\n` +
            `📊 Range: ${min} - ${max}\n` +
            `📈 Count: ${count}`;

      // Create control keyboard
      const keyboard = createInlineKeyboard([
        [
          {
            text: "🎲 Generate Again",
            action: "random",
            data: { min, max, count },
          },
          { text: "🔄 New Range", action: "random_config" },
        ],
        [
          {
            text: "1-10",
            action: "random",
            data: { min: 1, max: 10, count: 1 },
          },
          {
            text: "1-100",
            action: "random",
            data: { min: 1, max: 100, count: 1 },
          },
          {
            text: "1-1000",
            action: "random",
            data: { min: 1, max: 1000, count: 1 },
          },
        ],
        [
          { text: "🎯 Single", action: "random", data: { min, max, count: 1 } },
          {
            text: "🎲 3 Numbers",
            action: "random",
            data: { min, max, count: 3 },
          },
          {
            text: "🎰 5 Numbers",
            action: "random",
            data: { min, max, count: 5 },
          },
        ],
        [
          {
            text: "🪙 Coin Flip",
            action: "random",
            data: { min: 1, max: 2, count: 1 },
          },
          {
            text: "🎯 Dice Roll",
            action: "random",
            data: { min: 1, max: 6, count: 1 },
          },
        ],
        [{ text: "🏠 Back to Menu", action: "back_to_start" }],
      ]);

      await context.editMessageText(message, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });

      const resultText =
        count === 1
          ? `Generated: ${numbersList}`
          : `Generated ${count} numbers`;

      await context.answerCallbackQuery(resultText);
    } catch (error) {
      console.error("Error in random callback:", error);
      await context.answerCallbackQuery("Error generating random number");
    }
  },
};

export default callback;
