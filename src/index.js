import { stdout, stdin, argv } from 'process';
import { createReadStream, readdir } from 'fs';
import { createInterface } from 'readline';
import { homedir } from 'os';
import { join, dirname, extname } from 'path';
import { DirectoryItem } from './directory-item.js';

const username =
  argv
    .filter((item) => item.startsWith('--'))
    .join('')
    .split('=')[1] || 'Username';
const homePath = dirname(homedir());

const rl = createInterface({
  output: stdout,
  input: stdin,
});

const readStream = createReadStream(homePath);
let currentDirectory = join(homePath, username);

stdout.write(`Welcome to the File Manager, ${username}!\n`);

const closeConsole = () => {
  stdout.write(`Thank you for using File Manager, ${username}, goodbye!`);
  rl.close();
};

rl.on('line', (data) => {
  if (data.toString() === '.exit') {
    closeConsole();
  } else {
    switch (data.toString()) {
      case 'ls':
        readDirectory(currentDirectory);
        break;
      default:
        console.log('lol');
    }
    stdout.write(`You are currently in ${currentDirectory}\n`);
  }
});

const readDirectory = (path) => {
  const directoryItems = [];

  readdir(path, { withFileTypes: true }, (err, files) => {
    if (err) throw new Error('Error!');

    files.forEach((file) => {
      const item = new DirectoryItem(file.name, file.isFile() ? 'file' : 'directory');
      directoryItems.push(item);
    });

    console.table(directoryItems);
  });
};

rl.on('SIGINT', closeConsole);
