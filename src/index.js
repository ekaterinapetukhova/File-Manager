import { stdout, stdin, argv } from 'process';
import { readdir, createReadStream, open, rename, copyFile } from 'fs';
import { createInterface } from 'readline';
import { homedir } from 'os';
import { join, dirname, parse } from 'path';
import { DirectoryItem } from './directory-item.js';
import { dir } from 'console';

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

const readFile = async (path) => {
  const readStream = createReadStream(path);

  readStream.on('data', (data) => {
    stdout.write(`${data.toString()}\n`);
  });
};

const createFile = async (name) => {
  const filePath = join(currentDirectory, name);

  console.log(filePath);

  open(filePath, 'w', (err) => {
    if (err) console.log(err);
  });
};

const renameFile = async (path, name) => {
  const newPath = join(dirname(path), name);
  rename(path, newPath, (err) => {
    if (err) console.log(err);
  });
};

const copy = async (path, copyPath) => {
  copyFile(path, copyPath, (err) => {
    if (err) throw new Error(err);
  })
}

rl.on('line', (data) => {
  data = data.toString();

  if (data === '.exit') {
    closeConsole();
  }

  if (data === 'ls') {
    readDirectory(currentDirectory);
  }

  if (data === 'up') {
    returnDirectory(currentDirectory);
  }

  if (data.startsWith('cat')) {
    readFile(data.split(' ')[1]);
  }

  if (data.startsWith('cd')) {
    openDirectory(data.split(' ')[1]);
  }

  if (data.startsWith('add')) {
    createFile(data.split(' ')[1]);
  }

  if (data.startsWith('rn')) {
    renameFile(data.split(' ')[1], data.split(' ')[2]);
  }

  if (data.startsWith('cp')) {
    copy(data.split(' ')[1], data.split(' ')[2]);
  }

  stdout.write(`You are currently in ${currentDirectory}\n\n`);
});

rl.on('SIGINT', closeConsole);
