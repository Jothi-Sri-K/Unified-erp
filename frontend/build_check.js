const { execSync } = require('child_process');
const fs = require('fs');
try {
    const stdout = execSync('npm run build', { stdio: 'pipe' });
    fs.writeFileSync('build_output_node.txt', stdout.toString());
} catch (error) {
    fs.writeFileSync('build_output_node.txt', 'STDOUT:\n' + (error.stdout ? error.stdout.toString() : '') + '\nSTDERR:\n' + (error.stderr ? error.stderr.toString() : ''));
}
