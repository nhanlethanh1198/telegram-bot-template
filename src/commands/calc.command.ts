import type { Context } from "grammy";
import type { BaseCommandType } from ".";

const command: BaseCommandType = {
  name: "calc",
  aliases: ["calculate", "math"],
  description: "Perform mathematical calculations",
  category: "Utility",
  cooldown: 2,
  parameters: [
    {
      name: "expression",
      type: "string",
      required: true,
      description: "Mathematical expression to evaluate (e.g., 2+2, 10*5, sqrt(16))",
    },
  ],
  execute: async (context: Context, args?: Record<string, any>) => {
    try {
      const expression = args?.expression?.toString() || "";

      if (!expression.trim()) {
        await context.reply(
          "❌ Please provide a mathematical expression.\n\nUsage: `/calc <expression>`\n\nExamples:\n• `/calc 2+2`\n• `/calc 10*5-3`\n• `/calc sqrt(16)`\n• `/calc pow(2,3)`",
          { parse_mode: "Markdown" }
        );
        return;
      }

      // Sanitize the expression - only allow safe mathematical operations
      const sanitized = expression
        .replace(/[^0-9+\-*/.(),\s]/g, '') // Remove unsafe characters
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\bpow\b/g, 'Math.pow')
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/\blog\b/g, 'Math.log')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bfloor\b/g, 'Math.floor')
        .replace(/\bceil\b/g, 'Math.ceil')
        .replace(/\bround\b/g, 'Math.round');

      // Validate expression doesn't contain dangerous patterns
      if (
        sanitized.includes('=') ||
        sanitized.includes(';') ||
        sanitized.includes('function') ||
        sanitized.includes('eval') ||
        sanitized.includes('require') ||
        sanitized.includes('import')
      ) {
        await context.reply("❌ Invalid expression. Only mathematical operations are allowed.");
        return;
      }

      // Evaluate the expression safely
      let result: number;
      try {
        result = Function(`"use strict"; return (${sanitized})`)();
      } catch (evalError) {
        await context.reply(
          `❌ Invalid mathematical expression: \`${expression}\`\n\nPlease check your syntax and try again.`,
          { parse_mode: "Markdown" }
        );
        return;
      }

      // Check if result is valid
      if (typeof result !== 'number' || !isFinite(result)) {
        await context.reply("❌ Calculation resulted in an invalid number (infinity or NaN).");
        return;
      }

      // Format the result
      const formattedResult = Number.isInteger(result)
        ? result.toString()
        : parseFloat(result.toFixed(10)).toString();

      const message =
        `🧮 **Calculator**\n\n` +
        `📝 Expression: \`${expression}\`\n` +
        `🔢 Result: **${formattedResult}**`;

      await context.reply(message, { parse_mode: "Markdown" });

    } catch (error) {
      console.error("Error in calc command:", error);
      await context.reply("❌ An error occurred while performing the calculation.");
    }
  },
};

export default command;
