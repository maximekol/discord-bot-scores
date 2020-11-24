# discord-bot-scores

A bot for Discord servers to count members scores, self-hosted

---

## How do I use this?

**You must first have...**

* A `discord token` for your bot
* A computer that has working internet
* The ability to follow instructions

### Configuration Discord
1. Create a new application on your discord developer account https://discord.com/developers/applications
2. Generate an OAuth2 URL with the scope: bot and the right permission
3. Invote the bot to your Discord server
4. On Bot, copy the token

### Configuration Tenor API
1. Create a token for tenor Gif API https://tenor.com/gifapi

### Configuration Local
1. Copy and rename file auth_example.json to auth.json
2. Replace DISCORD_TOKEN with the token you just created from discord
3. Replace TENOR_API_KEY with the tenor token you just created

### Discord Configuration
1. Create a Role name: "Score Master", only the members with this rôle are able to update the scores

### Installation

1. Install Node js

```bash
brew install node
```

2. Install requirements
```bash
node install
```

3. Launch discord bot mute
```bash
node src/index.js
```

### Usage
1. Add one point with reaction
Add a reaction : 👍 to a message will add a point to the author (removing the reaction will decrease his score by 1)

2. Update score with command line + mention
Example 1 :
```bash
=+3 @Max
```
Will add 3 points to Max

Example 2 :
```bash
=-2 @Max
```
Will remove 2 points to Max

Example 3:
```bash
=+2 @Max @Tom
```
Will add 2 points to Max and 2 points to Tom

3. Multiple command in one line

```bash
=+3 @Max,-2 @Tom
```
Will add 3 points to Max and remove 2 points to Tom

4. Show Scores
```bash
=scores
```

Will result the current scores

![alt text](https://github.com/maximekol/discord-bot-scores/blob/master/scoresExamples.png?raw=true)


### Parameter
Change config.json to change some default parameters before launching the bot

1. change Master Role Name: 

```bash
"masterRoleName" : "Score Master",
```

2. Change the reaction to count the +1 score

```bash
"reactionScoreUpdate" :  "👍",
```

3. Change the prefix used to ask bot to update the score
```bash
"prefix" : "=",
```

---
## License

This project is licensed under GNU GPLv3

```
Copyright (C) 2020 Maxime Kolly

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
```
