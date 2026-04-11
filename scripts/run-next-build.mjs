import { spawn } from 'node:child_process';
import path from 'node:path';

const forwardedArgs = process.argv.slice(2);
const nextArgs = ['build', ...forwardedArgs];

if (process.platform === 'win32') {
    nextArgs.push('--webpack');
}

const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextBin, ...nextArgs], {
    stdio: 'inherit',
    env: process.env,
});

child.on('exit', (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }

    process.exit(code ?? 1);
});
