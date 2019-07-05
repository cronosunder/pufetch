#!/usr/bin/env node

'use strict';

const dns = require('dns');
const isUrl = require('is-url');
const got = require('got');
const ora = require('ora');
const jsonFile = require('jsonfile');
const fs = require('fs');
const chalk = require('chalk');
const cheerio = require('cheerio');
const logUpdate = require('log-update');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({pkg}).notify();

const spinner = ora();
const arg = process.argv[2];
const val = process.argv[4];
var urlLista = process.argv[3];

const setName = `${Math.random().toString(16).substr(10)}`;
console.log("ARG",process.argv);
let rad = `${process.argv[5]}` || setName;
if (rad === 'undefined.json') {
	rad = setName;
}

const {log} = console;
const end = process.exit;
const url = 'https://youtube.com/watch?v=';

const checkConnection = () => {
	dns.lookup('youtube.com', err => {
		if (err) {
			logUpdate(`\n${chalk.red('  ✖ ')} ${chalk.dim('Please check your internet connection!')}\n`);
			end(1);
		} else {
			logUpdate();
			spinner.text = 'Puffing...';
			spinner.start();
		}
	});
};

if (!arg || arg === '-h' || arg === '--help') {
	log(`
	        ${chalk.keyword('orange')('⚡⚡')} ${chalk.blue('Youtube Playlist Link Fetcher')} ${chalk.keyword('orange')('⚡⚡')}

 Usage: puf <commands> [url]
        puf <commands> [url] ${chalk.dim('<command>')}

 Commands:
   -f, ${chalk.dim('--fetch')}             Fetch url of items in the playlist
   -e, ${chalk.dim('--export')}            Export urls into json

 Extra:
   ${chalk.dim('-f')} url --name           Show links along with the title
   ${chalk.dim('-e')} url --name <name>    Set desired name of the exported playlist

 Help:
   $ puf -f ${chalk.dim('https://goo.gl/QcSugM')} --name
   $ puf -e ${chalk.dim('https://goo.gl/QcSugM')} --name course
		`);
	end(1);
}

if (!urlLista || isUrl(urlLista) === false) {
	log(`\n ${chalk.red('✖')} Things don't work this way. Provide a valid url\n\n ${chalk.blue('✔')} ${chalk.dim('Type')} ${chalk.cyan('$ puf --help')} ${chalk.dim('for more help')}\n`);
	end(1);
}

var urlOriginal = urlLista;

urlOriginal=urlOriginal.split("?")[1]
var partes = urlOriginal.split("&");
for(var i = 0 ; i< partes.length;i++){
	if(partes[i].startsWith("list=")){
		urlLista = " https://www.youtube.com/playlist?"+partes[i];
	}
}

if (arg === '-f' || arg === '--fetch') {
	checkConnection();
	got(urlLista).then(res => {
		const $ = cheerio.load(res.body);
		const thumb = $('tr');

		logUpdate();

		if ((arg === '-f' || arg === '--fetch') && val === '--name') {
			$(thumb).each((i, links) => {
				const sources = `${url}${$(links).attr('data-video-id')}`;
				const names = $(links).attr('data-title');

				log(` ${chalk.bold.blue('⚡⚡')} ${chalk.green(names)}`);
				log(` ${chalk.yellow('⏩ ')} ${sources}   \n`);
				spinner.stop();
			});
		} else {
			$(thumb).each((i, links) => {
				const sources = `${url}${$(links).attr('data-video-id')}`;
				log(` ${chalk.yellow('⏩ ')} ${sources}   \n`);
				spinner.stop();
			});
		}
	}).catch(error => {
		logUpdate(`\n${error}\n`);
		end(1);
	});
}

if (arg === '-e' || arg === '--export') {
	checkConnection();
	rad = rad+".json";
	got(urlLista).then(res => {
		const $ = cheerio.load(res.body);
		const tr = $('tr');
		logUpdate(`\n ${chalk.blue('🍁')}  Done! Playlist exported ${chalk.green(tr.length)} as : \n\n ${chalk.green('🌴')}  ${chalk.yellow(rad)} into ${chalk.blue(process.cwd())}\n`);
		for (let i = 0; i < tr.length; i++) {
			const obj = {
				playlist: []
			};

			for (let j = 0; j <= i; j++) {
				obj.playlist.push({
					id: tr.eq(j).attr('data-video-id'),
					url: url + tr.eq(j).attr('data-video-id'),
					name: tr.eq(j).attr('data-title')
				});
			}
			logUpdate(`\n ${chalk.blue('🍁')} La lista tiene  : \n\n ${chalk.green('🌴')}  ${chalk.yellow(rad)} into ${chalk.blue(process.cwd())}\n`);
			jsonFile.writeFile(rad, obj, {spaces: 2}, err => {
				end(1);
				log(err);
			});
		}

		spinner.stop();
	}).catch(error => {
		if (error) {
			logUpdate(`${error}`);
			end(1);
		}
	});
}

if (arg === '-t' || arg === '--txt') {
	checkConnection();
	rad = rad+".txt";
	got(urlLista).then(res => {
		const $ = cheerio.load(res.body);
		const tr = $('tr');
		logUpdate(`\n ${chalk.blue('🍁')}  Done! Playlist exported ${chalk.green(tr.length)} as : \n\n ${chalk.green('🌴')}  ${chalk.yellow(rad)} into ${chalk.blue(process.cwd())}\n`);
		for (let i = 0; i < tr.length; i++) {
			const obj = {
				playlist: []
			};

			for (let j = 0; j <= i; j++) {
				obj.playlist.push(url + tr.eq(j).attr('data-video-id')+"\t"+tr.eq(j).attr('data-title'));
			}
			logUpdate(`\n ${chalk.blue('🍁')} La lista tiene  :  ${chalk.green(obj.playlist.length)}  ${chalk.yellow(rad)} into ${chalk.blue(process.cwd())}\n`);
			fs.writeFile(rad, obj.playlist.join("\n"), {spaces: 2}, err => {
				end(1);
				log(err);
			});
		}

		spinner.stop();
	}).catch(error => {
		if (error) {
			logUpdate(`${error}`);
			end(1);
		}
	});
}
