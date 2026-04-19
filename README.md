<div align="center">

# 🛡️ VANGUARD

### *Advanced Discord Moderation Ecosystem*

[![Discord](https://img.shields.io/badge/Discord-Support%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/3TJEacm6RD)
[![Version](https://img.shields.io/badge/Version-1.0.0-blueviolet?style=for-the-badge)](https://github.com/SEJED-DEV/Vanguard-discord-bot/releases)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](https://github.com/SEJED-DEV/Vanguard-discord-bot/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/SEJED-DEV/Vanguard-discord-bot?style=for-the-badge&color=f59e0b)](https://github.com/SEJED-DEV/Vanguard-discord-bot/stargazers)

<br/>

> *"Protecting your community, one command at a time."*

<br/>

**Vanguard** is a production-grade, self-hosted Discord moderation bot engineered from the ground up for stability, performance, and precision. Built on atomic SQLite transactions, a true LRU caching layer, and fail-safe interaction recovery — Vanguard eliminates race conditions and API phantom-actions that plague conventional bots.

</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture & Reliability](#️-architecture--reliability)
- [💻 Command Reference](#-command-reference)
- [📡 Installation](#-installation)
- [🔑 Environment Variables](#-environment-variables)
- [⚙️ In-Bot Configuration](#️-in-bot-configuration)
- [🛠️ Diagnostics & Troubleshooting](#️-diagnostics--troubleshooting)
- [🤝 Support](#-support)
- [📄 License](#-license)

---

## ✨ Features

<table>
<tr>
<td width="50%">

**🔨 Complete Moderation Suite**
Full slash command coverage for every moderation action — ban, kick, timeout, warn, unban, untimeout, and unwarn — all with pre-action DM notifications and instant case logging.

</td>
<td width="50%">

**📋 Atomic Case Management**
Every action is recorded atomically via `better-sqlite3` transactions. Case numbers are assigned via a subquery lock, preventing race conditions even under simultaneous high-volume moderation.

</td>
</tr>
<tr>
<td width="50%">

**🎨 Per-Guild Custom Branding**
Server admins can fully customise the bot's emoji set with their own custom Discord emojis. Use `/config emojis` to bind any emoji to the bot's UI elements.

</td>
<td width="50%">

**⚡ True LRU Configuration Cache**
Guild configurations are cached in-memory using a real Least-Recently-Used algorithm. Only cold, inactive servers are flushed — your busiest guilds stay loaded and fast.

</td>
</tr>
<tr>
<td width="50%">

**🔐 Developer Privacy Layers**
Internal diagnostics and error logs are transmitted exclusively to the developer's support server. Guild-level infractions never leave the target guild's log channel.

</td>
<td width="50%">

**🚨 Battle-Tested Error Recovery**
Global process-level handlers catch every unhandled rejection and exception. A nested fallback system ensures Discord outages never crash the process loop.

</td>
</tr>
<tr>
<td width="50%">

**🛡️ DM-And-Fail Protection**
Bot permissions are explicitly verified via `PermissionFlagsBits` *before* any DM is sent to a target. Eliminates the scenario where a user receives a false punishment DM.

</td>
<td width="50%">

**⏱️ Per-Command Rate Limiting**
Built-in global cooldown system with per-user, per-command timestamps. Owner bypass included. Prevents command spam and Discord API rate limit accumulation.

</td>
</tr>
</table>

---

## 🏗️ Architecture & Reliability

```
┌─────────────────────────────────────────────────────┐
│                    VANGUARD CORE                     │
├──────────────┬──────────────────┬───────────────────┤
│  Entry Point │  Command Handler  │   Event Handler   │
│  src/index.js│commandHandler.js  │ eventHandler.js   │
├──────────────┴──────────────────┴───────────────────┤
│                   Utility Layer                      │
│   logger.js │ moderation.js │ permissions.js         │
│   emojis.js │ system.js                              │
├─────────────────────────────────────────────────────┤
│                   Database Layer                     │
│       better-sqlite3 │ LRU Config Cache              │
│   Atomic Transactions │ Indexed Case Queries          │
└─────────────────────────────────────────────────────┘
```

### Atomic Case Numbering
Case IDs are assigned using an atomic SQL subquery that locks the row during assignment:
```sql
INSERT INTO cases (caseNumber, ...)
VALUES ((SELECT IFNULL(MAX(caseNumber), 0) + 1 FROM cases WHERE guildId = ?), ...)
```
This means 100 simultaneous bans will still produce perfectly sequential case numbers.

### True LRU Cache
The config cache uses a Map with delete-and-reinsert on read to maintain access order — the standard Map insertion order trick — rather than a naive FIFO that could evict active servers.

### Boot Validation
```js
// Hard stop if critical env vars are missing
if (!process.env.TOKEN || !process.env.CLIENT_ID) {
    console.error('[CRITICAL-FATAL] Missing TOKEN or CLIENT_ID. Aborting.');
    process.exit(1);
}
```

---

## 💻 Command Reference

### 🔨 Moderation Commands

| Command | Description | Permission Required |
|---------|-------------|---------------------|
| `/ban <user> [reason]` | Permanently ban a user. Sends a DM notification before execution. | `Ban Members` |
| `/unban <user> [reason]` | Revoke a ban by user ID. Logs a case entry on success. | `Ban Members` |
| `/kick <user> [reason]` | Remove a user from the server. DM is sent before kick. | `Kick Members` |
| `/timeout <user> <duration> [reason]` | Mute a user for a set duration (5s–28d). Supports `10m`, `1h`, `1d` format. | `Moderate Members` |
| `/untimeout <user> [reason]` | Immediately lift an active timeout. | `Moderate Members` |
| `/warn <user> <reason>` | Issue a formal warning logged to the database. | `Moderate Members` |
| `/unwarn <user> [reason]` | Remove a warning from a user's case history. | `Moderate Members` |
| `/logs <user>` | Retrieve a user's full infraction history with timestamps and case numbers. | `Moderate Members` |

### ⚙️ Configuration Commands

| Command | Description | Permission Required |
|---------|-------------|---------------------|
| `/config logs <channel>` | Set the guild's local moderation log channel. | `Administrator` |
| `/config emojis <key> <emoji>` | Map a custom emoji to a bot UI element (success, error, ban, kick, warn, timeout). | `Administrator` |

### 🛠️ Utility & Owner Commands

| Command | Description | Permission Required |
|---------|-------------|---------------------|
| `/status` | Display bot uptime, memory usage, and guild count. | None |
| `/say <message>` | Make the bot send a message to a channel. | Bot Owner |
| `/get-emojis` | List all emoji mappings configured for the current guild. | Bot Owner |

---

## 📡 Installation

### Prerequisites
- **Node.js** `v20.0.0` or higher — *required*
- **npm** `v8+`
- A Discord Application created at [discord.com/developers](https://discord.com/developers/applications)

### Step 1 — Clone the Repository
```bash
git clone https://github.com/SEJED-DEV/Vanguard-discord-bot.git
cd Vanguard-discord-bot
```

### Step 2 — Install Dependencies
```bash
npm install
```

### Step 3 — Configure Environment
```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Then open `.env` and fill in your values (see [Environment Variables](#-environment-variables) below).

### Step 4 — Start the Bot

**Development:**
```bash
node src/index.js
```

**Production (recommended with PM2):**
```bash
npm install -g pm2
pm2 start src/index.js --name "vanguard-bot"
pm2 save
pm2 startup
```

---

## 🔑 Environment Variables

All configuration is handled through your `.env` file. Copy `.env.example` as a starting point.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TOKEN` | ✅ Yes | — | Your Discord bot token from the Developer Portal |
| `CLIENT_ID` | ✅ Yes | — | Your application's Client ID (used to register slash commands) |
| `OWNER_ID` | ✅ Yes | — | Your personal Discord user ID (enables owner-only commands) |
| `BOT_NAME` | No | `Vanguard` | Display name used in embeds and footers |
| `SUPPORT_SERVER_ID` | No | — | Guild ID where internal error logs are sent |
| `SUPPORT_SERVER_LINK` | No | `https://discord.gg/3TJEacm6RD` | Public invite link shown in bot responses |
| `LOG_BANS_CHANNEL` | No | — | Channel ID for ban logs in the support server |
| `LOG_KICKS_CHANNEL` | No | — | Channel ID for kick logs in the support server |
| `LOG_WARNS_CHANNEL` | No | — | Channel ID for warn logs in the support server |
| `LOG_TIMEOUTS_CHANNEL` | No | — | Channel ID for timeout logs in the support server |
| `LOG_ERRORS_CHANNEL` | No | — | Channel ID for bot error logs in the support server |
| `DATABASE_PATH` | No | `./vanguard.sqlite` | Relative path where the SQLite database is stored |
| `DEFAULT_COOLDOWN` | No | `3` | Default command cooldown in seconds |

> ⚠️ **Critical:** If `TOKEN` or `CLIENT_ID` are missing, the bot will immediately exit with a `[CRITICAL-FATAL]` error rather than entering an invalid state.

---

## ⚙️ In-Bot Configuration

Once the bot is online, configure it in your server with slash commands:

**Setting up a log channel:**
```
/config logs #mod-logs
```

**Customising emojis:**
```
/config emojis key:ban emoji:<:ban:1234567890>
/config emojis key:success emoji:✅
/config emojis key:error emoji:❌
```

Available emoji keys: `success`, `error`, `ban`, `kick`, `warn`, `timeout`, `unban`

---

## 🛠️ Diagnostics & Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `[CRITICAL-FATAL] Missing TOKEN or CLIENT_ID` | Environment variables not set | Add `TOKEN` and `CLIENT_ID` to your `.env` file |
| `[ERROR] CLIENT_ID is missing` | `CLIENT_ID` present in `.env` but not parsed | Check for typos or invisible characters in your `.env` |
| Commands not showing in Discord | Slash commands failed to register | Ensure `CLIENT_ID` is correct and the bot has `applications.commands` scope |
| `Failed to log to guild` | Bot missing channel permissions | Grant the bot `View Channel`, `Send Messages`, and `Embed Links` in the log channel |
| Embeds missing emojis | Custom emoji not from a shared server | Ensure the bot is in the server that owns the emoji |
| `Interaction Failed` on command | Interaction token expired (>3s) | Commands use `deferReply()` — if still seeing this, check for unhandled errors in the console |

---

## 🤝 Support

<div align="left">

[![Discord Support](https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/3TJEacm6RD)
[![Instagram](https://img.shields.io/badge/Instagram-Follow-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/http.sejed.official/)

</div>

- 🐛 **Bug Reports** — [Open an Issue](https://github.com/SEJED-DEV/Vanguard-discord-bot/issues)
- 💬 **Live Help** — [Join the Support Server](https://discord.gg/3TJEacm6RD)
- 👨‍💻 **Developer** — sejed

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.

---

<div align="center">

Engineered with ❤️ by **Sejed TRABELSSI**

</div>
