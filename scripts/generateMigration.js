const { exec } = require('child_process');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter migration name: ', (migrationName) => {
  rl.question('Enter module name: ', (moduleName) => {
    const migrationsDir = path.resolve(__dirname, `../src/modules/${moduleName}/migrations`).replace(/\\/g, '/');
    const command = `npx typeorm migration:create ${migrationsDir}/${migrationName}`;

    console.log(`Executing command: ${command}`);
    
    exec(command, { shell: true }, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error: ${err.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Stdout: ${stdout}`);
    });
    
    rl.close();
  });
});
