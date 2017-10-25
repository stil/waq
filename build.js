const fs = require('fs');
const { spawn } = require('child_process');
const manifest = require('./manifest.json');

const archivePath = `WhatsAppQuartz-${manifest.version}.zip`;
const sevenZipExe = 'C:\\Program Files\\7-Zip\\7z.exe';

// Delete packed extension if exists.
try {
  fs.unlinkSync(archivePath);
} catch (e) {
  if (e.code !== 'ENOENT') { // ENOENT: 2 - No such file or directory
    throw e;
  }
}

// Pack extension.
const proc = spawn(sevenZipExe, [
  'a',
  archivePath,
  'src',
  'manifest.json',
]);

proc.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

proc.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

proc.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
