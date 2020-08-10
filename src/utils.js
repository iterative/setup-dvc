const util = require('util');

const execp = util.promisify(require('child_process').exec);
const exec = async (command, opts) => {
  return new Promise(function(resolve, reject) {
    const {debug} = opts || {};

    execp(command, (error, stdout, stderr) => {
      if (debug)
        console.log(`\nCommand: ${command}\n\t${stdout}\n\t${stderr}`);

      if (error)
        reject(error);

      resolve((stdout || stderr).slice(0, -1));
    });
  });
};

const setup_dvc = async opts => {
  const {version, remote_driver = 'all'} = opts;
  try {
    console.log(`Uninstalling previous DVC`);
    await exec(`pip uninstall -y dvc`);
  } catch (err) {
  }

  console.log(`Installing DVC version ${version} with remote ${remote_driver}`);
  await exec(`yes | pip install dvc[${remote_driver}]${
      version !== 'latest' ? `==${version}` : ''}`);
};

exports.exec = exec;
exports.setup_dvc = setup_dvc;
