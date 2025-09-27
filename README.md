# Enhanced Telegram Bot

A powerful and extensible Telegram bot built with TypeScript, Bun, and Grammy featuring dynamic commands and interactive callback queries.

## Features

🚀 **Dynamic Command System**
- Automatic command registration from files
- Parameter validation and type checking
- Command aliases support
- Cooldown management
- Admin-only commands
- Category-based organization

🎯 **Interactive Callbacks**
- Dynamic callback query handling
- Parameter passing through callbacks
- Cooldown and permission management
- Interactive button interfaces

⚡ **Built with Modern Tech**
- **TypeScript** for type safety
- **Bun** for fast runtime
- **Grammy** for Telegram Bot API
- **Zod** for environment validation
- **RxJS** for reactive programming

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) installed
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd telegram
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment:
```bash
echo "TELEGRAM_BOT_TOKEN=your_bot_token_here" > .env
```

4. Start development server:
```bash
bun dev
```

## Available Commands

### General Commands
- `/start` - Welcome message with interactive menu
- `/help [command]` - Show help information
- `/whatime [timezone] [format]` - Display current time
  - Supports timezones: UTC, America/New_York, Europe/London, Asia/Tokyo, Australia/Sydney
  - Formats: 12h, 24h

### Utility Commands
- `/calc <expression>` - Mathematical calculator
  - Supports: +, -, *, /, sqrt(), pow(), sin(), cos(), tan(), etc.
  - Example: `/calc sqrt(16) + 2*3`

- `/poll "<question>" "<options>" [anonymous] [multiple]` - Create polls
  - Example: `/poll "Favorite color?" "Red;Blue;Green" false true`

### Admin Commands (Admin Only)
- `/admin [action]` - Admin control panel
  - Actions: stats, users, restart, broadcast

## Project Structure

```
src/
├── main.ts              # Bot entry point
├── envValidate.ts       # Environment validation
├── commands/            # Command handlers
│   ├── index.ts         # Command registration system
│   ├── help.command.ts  # Help command
│   ├── start.command.ts # Start command
│   ├── calc.command.ts  # Calculator command
│   ├── poll.command.ts  # Poll creation command
│   └── admin.command.ts # Admin commands
└── callbacks/           # Callback query handlers
    ├── index.ts         # Callback registration system
    ├── help.callback.ts # Help callback
    ├── time.callback.ts # Time display callback
    └── random.callback.ts # Random number generator
```

## Creating New Commands

Create a new file in `src/commands/` with the pattern `*.command.ts`:

```typescript
import type { Context } from "grammy";
import type { BaseCommandType } from ".";

const command: BaseCommandType = {
  name: "mycommand",
  aliases: ["mc", "cmd"],
  description: "My awesome command",
  category: "Custom",
  cooldown: 5, // 5 seconds
  parameters: [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Some text input"
    }
  ],
  execute: async (context: Context, args?: Record<string, any>) => {
    const text = args?.text || "Hello!";
    await context.reply(`You said: ${text}`);
  },
};

export default command;
```

## Creating New Callbacks

Create a new file in `src/callbacks/` with the pattern `*.callback.ts`:

```typescript
import type { Context } from "grammy";
import type { BaseCallbackType } from ".";

const callback: BaseCallbackType = {
  name: "my_action",
  description: "My callback action",
  category: "Custom",
  execute: async (context: Context, data?: Record<string, any>) => {
    await context.editMessageText("Action executed!");
    await context.answerCallbackQuery("Done!");
  },
};

export default callback;
```

## Environment Variables

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
NODE_ENV=development|production
```

## Scripts

```bash
# Development with hot reload
bun dev

# Build for production
bun run build

# Start production build
bun start
```

## Command Parameters

Commands support various parameter types:

- **string**: Text input
- **number**: Numeric input
- **boolean**: true/false values

Parameters can be:
- **required**: Must be provided
- **optional**: Can be omitted
- **choices**: Limited to specific values

## Interactive Features

### Inline Keyboards

Use the utility functions to create interactive buttons:

```typescript
import { createInlineKeyboard } from "../callbacks";

const keyboard = createInlineKeyboard([
  [
    { text: "Button 1", action: "action1" },
    { text: "Button 2", action: "action2", data: { param: "value" } }
  ]
]);
```

### Callback Data

Pass data through callback queries:

```typescript
// Simple action
{ text: "Click me", action: "simple_action" }

// With parameters
{ text: "Click me", action: "complex_action", data: { id: 123, type: "user" } }
```

## Admin Features

Admin-only commands are automatically restricted to users with administrator permissions in the chat. The bot checks:

- Chat administrator status
- Chat creator status

## Security Features

- Parameter validation and sanitization
- SQL injection prevention in calculator
- Rate limiting through cooldowns
- Admin permission verification
- Safe callback data parsing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your commands/callbacks following the existing patterns
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check existing commands for examples
- Review the TypeScript interfaces for available options