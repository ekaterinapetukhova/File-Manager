import { stdout, stdin, argv } from 'process';
import { createWriteStream } from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  output: stdout,
  input: stdin,
});

const username =
  argv
    .filter((item) => item.startsWith('--'))
    .join('')
    .split('=')[1] || 'Username';

stdout.write(`Welcome to the File Manager, ${username}!`)

const closeConsole = () => {
  stdout.write(`Thank you for using File Manager, ${username}, goodbye!`)
  rl.close();
}

rl.on('line', (data) => {
  if (data.toString() === '.exit') {
    closeConsole();
  }
});

rl.on('SIGINT', closeConsole)


// stdin.on('data', (usernameData) => {
//   stdout.write(`Welcome to the File Manager, ${usernameData ? usernameData : 'Username'}!`);
//   username = usernameData;
// });
