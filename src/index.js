import { stdout, stdin, argv } from 'process';
import { readdir, createReadStream, open, rename, createWriteStream, rm } from 'fs';
import { createInterface } from 'readline';
import { homedir, EOL, userInfo, arch, cpus } from 'os';
import { join, dirname, parse } from 'path';
import { DirectoryItem } from './directory-item.js';
import { createHash } from 'crypto';

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
    if (err) throw new Error('Operation failed');

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
    console.log('Operation failed');
  } else {
    currentDirectory = dirname(path);
  }
};

const readFile = async (path) => {
  try {
    const readStream = createReadStream(path);

    readStream.on('data', (data) => {
      stdout.write(`${data.toString()}\n`);
    });
  } catch (err) {
    console.log('Operation failed');
  }
};

const createFile = async (name) => {
  const filePath = join(currentDirectory, name);

  open(filePath, 'w', (err) => {
    if (err) console.log('Operation failed');
  });
};

const renameFile = async (path, name) => {
  const newPath = join(dirname(path), name);
  rename(path, newPath, (err) => {
    if (err) console.log('Operation failed');
  });
};

const copyFile = async (path, copyPath) => {
  try {
    const readStream = createReadStream(path);
    const writeStream = createWriteStream(copyPath);

    readStream.pipe(writeStream);
  } catch (err) {
    console.log('Operation failed');
  }
};

const deleteFile = async (path) => {
  rm(path, (err) => {
    if (err) console.log('Operation failed');
  });
};

const moveFile = async (path, newPath) => {
  const readStream = createReadStream(path);
  const writeStream = createWriteStream(newPath);

  readStream.pipe(writeStream);

  deleteFile(path);
};

const calculateHash = (path) => {
  const hash = createHash('sha256');
  const readStream = createReadStream(path);

  readStream.on('data', (data) => {
    stdout.write(`${hash.update(data.toString()).digest('hex')}\n`);
  });
};

const showCpus = () => {
  const cpuArr = [];

  cpus().forEach((cpu) => {
    cpuArr.push({ name: cpu.model, speed: cpu.speed })
  })

console.table(cpuArr);
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
    copyFile(data.split(' ')[1], data.split(' ')[2]);
  }

  if (data.startsWith('rm')) {
    deleteFile(data.split(' ')[1]);
  }

  if (data.startsWith('mv')) {
    moveFile(data.split(' ')[1], data.split(' ')[2]);
  }

  if (data.startsWith('hash')) {
    calculateHash(data.split(' ')[1]);
  }

  if (data.startsWith('os')) {
    switch (data.split(' ')[1]) {
      case '--EOL':
        stdout.write(`${JSON.stringify(EOL)}\n`);
        break;
      case '--homedir':
        stdout.write(`${homePath}\n`);
        break;
      case '--username':
        stdout.write(`${userInfo().username}\n`);
        break;
      case '--architecture':
        stdout.write(`${arch()}\n`);
        break;
      case '--cpus':
        showCpus();
        break;
    }
  }

  stdout.write(`You are currently in ${currentDirectory}\n\n`);
});

rl.on('SIGINT', closeConsole);
