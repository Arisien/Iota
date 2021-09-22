const inquirer = require('inquirer');
const ffmpeg = require('fluent-ffmpeg');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');
const chalk = require('chalk');

// Search for Video and return Info
const search = async () => {
	const { query } = await inquirer.prompt({type:"input", name:"query", message: "Input search query"});
	const results = await ytsr(query, {limit:5});

	const choices = [];
	const map = new Map();

	for (const result of results.items) {
		if (result.isUpcoming || result.type != "video") continue;
		map.set(result.title, result);
		choices.push(result.title);
	}

	const { title } = await inquirer.prompt({type: "list", name: "title", message: "Select a video", choices: choices});

	return map.get(title);
}

// Play Video from Info
const play = async (video) => {
	const stream = ytdl(video.url);

	console.log(`${chalk.yellow('⌛')} Downloading`);

	const proc = new ffmpeg({source:stream});

	proc.withAudioCodec('libmp3lame')

	proc.toFormat('mp3');

	proc.saveToFile('./temp.mp3');

	proc.on ('error', function(err) {
		console.log(`${chalk.red('❗')} Failed`);
	});

	proc.on('end', function () {
		console.log(`${chalk.green('📁')} Downloaded`);
	});

}

const main = async () => {
	const video = await search();
	await play(video);
}

main();
