import { stdout, stdin, argv } from 'process';
import { readdir, createReadStream } from 'fs';
import { createInterface } from 'readline';
import { homedir } from 'os';
import { join, dirname, parse } from 'path';
import { DirectoryItem } from './directory-item.js';

const username =
  argv
    .filter((item) => item.startsWith('--'))
    .join('')
    .split('=')[1] || 'Username';
const homePath = join(dirname(homedir()), username);
let currentDirectory = homePath;

const rl = createInterface({
  output: stdout,
  input: stdin,
  prompt: '>',
});

stdout.write(`Welcome to the File Manager, ${username}!\n\n`);
stdout.write(`You are currently in ${currentDirectory}\n\n`);

const closeConsole = () => {
  stdout.write(`Thank you for using File Manager, ${username}, goodbye!`);
  rl.close();
};

rl.on('line', (data) => {
  data = data.toString();

  if (data === '.exit') {
    closeConsole();
  } else {
    if (data === 'ls') {
      readDirectory(currentDirectory);
    }

    if (data === 'up') {
      returnDirectory(currentDirectory);
    }

    if (data.startsWith('cat')) {
      readFile(data.split(' ')[1]);
    }
  }

  if (data.startsWith('cd')) {
    openDirectory(data.split(' ')[1]);
  }

  stdout.write(`You are currently in ${currentDirectory}\n\n`);
});

const openDirectory = (path) => {
  currentDirectory = join(path);
};

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

const returnDirectory = (path) => {
  if (path === parse(homePath).root) {
    currentDirectory = path;
    stdout.write('Operation failed\n');
  } else {
    currentDirectory = dirname(path);
  }
};

const readFile = (path) => {
  currentDirectory = path;

  console.log(currentDirectory);

  const readStream = createReadStream(currentDirectory);

  readStream.on('data', (data) => stdout.write(data.toString));
}

rl.on('SIGINT', closeConsole);
