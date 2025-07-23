import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription('このbotについての情報です。');


export async function execute(interaction){
	await interaction.reply('Made by tuna334 \n使い方 \nメッセージにリプライで「!mention 回数(1-15)」 \n回数分リプライしたメッセージの送信者をメンションします\n \n/roll 分 人数 景品\n入力した分後にリアクション者の中から抽選で人数人選びます');
}