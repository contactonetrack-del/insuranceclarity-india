import { execSync } from 'node:child_process';

function run(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (error) {
        return `${error.stdout ?? ''}${error.stderr ?? ''}`;
    }
}

const output = run('npx prisma migrate status');

process.stdout.write(output.trimEnd());
process.stdout.write('\n\n');
process.stdout.write('Next step: review docs/ops/live-database-rollout.md before applying migrations.\n');
