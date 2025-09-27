import type { Context } from "grammy";
import type { BaseCommandType } from ".";
import { createInlineKeyboard } from "../callbacks";

const command: BaseCommandType = {
  name: "admin",
  aliases: ["status", "info"],
  description: "Show bot status and admin controls",
  category: "Admin",
  adminOnly: true,
  cooldown: 5,
  parameters: [
    {
      name: "action",
      type: "string",
      required: false,
      description: "Admin action to perform",
      choices: ["stats", "users", "restart", "broadcast"],
    },
  ],
  execute: async (context: Context, args?: Record<string, any>) => {
    try {
      const action = args?.action || "status";

      switch (action) {
        case "stats":
          await showStats(context);
          break;
        case "users":
          await showUsers(context);
          break;
        case "restart":
          await handleRestart(context);
          break;
        case "broadcast":
          await showBroadcastHelp(context);
          break;
        default:
          await showAdminPanel(context);
      }
    } catch (error) {
      console.error("Error in admin command:", error);
      await context.reply("❌ An error occurred while executing admin command.");
    }
  },
};

async function showAdminPanel(context: Context) {
  const uptime = process.uptime();
  const uptimeFormatted = formatUptime(uptime);
  const memoryUsage = process.memoryUsage();
  const memoryMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

  const adminMessage = `👑 **Admin Control Panel**

🤖 **Bot Status:**
• Status: ✅ Online
• Uptime: ${uptimeFormatted}
• Memory Usage: ${memoryMB} MB
• Node.js Version: ${process.version}
• Platform: ${process.platform}

📊 **Quick Stats:**
• Commands Available: Available via /help
• Active Since: ${new Date(Date.now() - uptime * 1000).toISOString()}
• Process ID: ${process.pid}

🛠️ **Available Actions:**
Use the buttons below or commands:
• \`/admin stats\` - Detailed statistics
• \`/admin users\` - User information
• \`/admin broadcast\` - Broadcast help
• \`/admin restart\` - Restart confirmation`;

  const keyboard = createInlineKeyboard([
    [
      { text: "📊 Statistics", action: "admin_stats" },
      { text: "👥 Users", action: "admin_users" },
    ],
    [
      { text: "📢 Broadcast Help", action: "admin_broadcast" },
      { text: "🔧 System Info", action: "admin_system" },
    ],
    [
      { text: "⚠️ Restart Bot", action: "admin_restart" },
    ],
    [
      { text: "🏠 Back to Menu", action: "back_to_start" },
    ],
  ]);

  await context.reply(adminMessage, {
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
}

async function showStats(context: Context) {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  const statsMessage = `📊 **Detailed Bot Statistics**

⏱️ **Performance:**
• Uptime: ${formatUptime(uptime)}
• Memory Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
• Memory Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
• Memory RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
• Memory External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB

🖥️ **System:**
• Node.js Version: ${process.version}
• Platform: ${process.platform} ${process.arch}
• Process ID: ${process.pid}
• Working Directory: ${process.cwd()}

📈 **Runtime:**
• Started: ${new Date(Date.now() - uptime * 1000).toLocaleString()}
• Environment: ${process.env.NODE_ENV || 'development'}
• Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}

💾 **Features:**
• Commands: Dynamic loading enabled
• Callbacks: Interactive buttons enabled
• Cooldowns: Active
• Admin Controls: Enabled`;

  await context.reply(statsMessage, { parse_mode: "Markdown" });
}

async function showUsers(context: Context) {
  const usersMessage = `👥 **User Information**

📱 **Current Chat:**
• Chat ID: \`${context.chat?.id}\`
• Chat Type: ${context.chat?.type}
• User ID: \`${context.from?.id}\`
• Username: @${context.from?.username || 'N/A'}
• First Name: ${context.from?.first_name || 'N/A'}
• Last Name: ${context.from?.last_name || 'N/A'}
• Language: ${context.from?.language_code || 'N/A'}

ℹ️ **Note:**
This bot doesn't store user data persistently.
To implement user tracking, you would need to add a database integration.

🔧 **Available User Actions:**
• View current chat info (shown above)
• Check user permissions
• Manage admin status (requires implementation)`;

  await context.reply(usersMessage, { parse_mode: "Markdown" });
}

async function handleRestart(context: Context) {
  const keyboard = createInlineKeyboard([
    [
      { text: "⚠️ Confirm Restart", action: "admin_confirm_restart" },
      { text: "❌ Cancel", action: "admin_panel" },
    ],
  ]);

  await context.reply(
    "⚠️ **Restart Confirmation**\n\n" +
    "Are you sure you want to restart the bot?\n\n" +
    "⚡ This will temporarily disconnect all users and reload all modules.\n" +
    "🔄 The bot will automatically reconnect after restart.\n" +
    "⏱️ Expected downtime: 5-10 seconds",
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
}

async function showBroadcastHelp(context: Context) {
  const broadcastMessage = `📢 **Broadcast Help**

🚧 **Feature Status:** Not Implemented

To implement broadcasting, you would need:

**1. Database Integration:**
• Store user/chat IDs
• Track user preferences
• Handle opt-outs

**2. Broadcast Command:**
\`\`\`typescript
/broadcast "Your message here"
\`\`\`

**3. Safety Features:**
• Rate limiting
• User consent
• Spam protection
• Delivery tracking

**4. Implementation Example:**
\`\`\`typescript
// Store user IDs when they interact
const users = new Set<number>();

// Broadcast function
async function broadcast(message: string) {
  for (const userId of users) {
    try {
      await bot.api.sendMessage(userId, message);
    } catch (error) {
      // Handle blocked users, errors
    }
  }
}
\`\`\`

**⚖️ Legal Considerations:**
• Obtain user consent
• Provide unsubscribe option
• Follow Telegram ToS
• Comply with local laws`;

  await context.reply(broadcastMessage, { parse_mode: "Markdown" });
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export default command;
