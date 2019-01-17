const fs = require('fs-extra');
const path = require('path');
const { execSync, fork } = require('child_process');
const Listr = require('listr');
const color = require('ansi-colors');
const run = require('./run');

const SCRIPTS_DIR = __dirname;
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const buildId = getBuildId();


const start = Date.now();

run(async () => {
  execSync('npm install resolve@1.8.1', {
    cwd: path.join(__dirname, '..', 'node_modules', 'rollup-plugin-node-resolve')
  });

  await fs.remove(DIST_DIR);

  const scripts = [
    ['CLI', 'build-cli.js'],
    ['Compiler', 'build-compiler.js'],
    ['Dev Sever', 'build-dev-server.js'],
    ['Dev Server Client', 'build-dev-server-client.js'],
    ['Mock Doc', 'build-mock-doc.js'],
    ['Renderer VDOM', 'build-renderer-vdom.js'],
    ['Runtime', 'build-runtime.js'],
    ['Screenshot', 'build-screenshot.js'],
    ['Submodules', 'build-submodules.js'],
    ['Sys Node', 'build-sys-node.js'],
    ['Testing', 'build-testing.js']
  ];

  const tasks = scripts.map(script => {
    return {
      title: script[0],
      task: () => {
        return new Promise((resolve, reject) => {
          const cp = fork(path.join(SCRIPTS_DIR, script[1]), [`--build-id=${buildId}`]);
          cp.on('exit', resolve);
          cp.on('error', reject);
        });
      }
    };
  });

  const listr = new Listr(tasks, { concurrent: true, showSubtasks: false });
  await listr.run();

  console.log(color.dim(`\n  Build: ${Date.now() - start}ms\n`));
});


function getBuildId() {
  const d = new Date();

  let buildId = ('0' + d.getUTCFullYear()).slice(-2);
  buildId += ('0' + (d.getUTCMonth() + 1)).slice(-2);
  buildId += ('0' + d.getUTCDate()).slice(-2);
  buildId += ('0' + d.getUTCHours()).slice(-2);
  buildId += ('0' + d.getUTCMinutes()).slice(-2);
  buildId += ('0' + d.getUTCSeconds()).slice(-2);

  return buildId;
}
