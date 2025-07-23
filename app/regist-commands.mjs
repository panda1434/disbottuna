import fs from 'fs';
import path from 'path';
import { REST, Routes } from 'discord.js';

const commands = [];
const foldersPath = path.join(process.cwd(), 'commands');
const commandFolders = fs.readdirSync(foldersPath);

export default async () => {
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.mjs'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const module = await import(filePath);
      commands.push(module.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log(`[INIT] ${commands.length}つのスラッシュコマンドを更新します。`);

    await rest.put(
      Routes.applicationCommands(process.env.APPLICATION_ID),
      { body: commands },
    );

    console.log(`[INIT] ✅ スラッシュコマンドを正常に更新しました。`);
  } catch (error) {
    console.error(`[INIT] ❌ スラッシュコマンドの更新に失敗しました:`, error);
  }
};
