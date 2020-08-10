const util = require('util');
const core = require('@actions/core');

const execp = util.promisify(require('child_process').exec);
const exec = async (command, opts) => {
  return new Promise(function(resolve, reject) {
    const { debug } = opts || {};

    execp(command, (error, stdout, stderr) => {
      if (debug) console.log(`\nCommand: ${command}\n\t${stdout}\n\t${stderr}`);

      if (error) reject(error);

      resolve((stdout || stderr).slice(0, -1));
    });
  });
};

const setup_dvc = async opts => {
  const { version } = opts;
  core.info(`Intalling DVC version ${version}`);
  await exec(
    `pip install dvc[all]${version !== 'latest' ? `==${version}` : ''}`
  );
};

exports.exec = exec;
exports.setup_dvc = setup_dvc;
