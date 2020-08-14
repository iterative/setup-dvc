const util = require('util');

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
  const { platform } = process;

  if (platform === 'linux') {
    let sudo = '';
    try {
      sudo = await exec('which sudo');
    } catch (err) {}

    console.log(
      await exec(`${sudo} wget https://dvc.org/deb/dvc.list -O /etc/apt/sources.list.d/dvc.list && \
        ${sudo} apt update && \
        ${sudo} apt -y --allow-downgrades install dvc${
        version !== 'latest' ? `=${version}` : ''
      }`)
    );
  }

  if (platform === 'darwin' || platform === 'win32')
    console.log(
      // await exec(`brew update && brew install python3.8 && brew install dvc`)
      await exec(
        `wget -O "dvc.pkg" 'https://github.com/iterative/dvc/releases/download/${version}/dvc-${version}.pkg' && sudo installer -pkg "dvc.pkg" -target / && rm -f "dvc.pkg"`
      )
    );
};

exports.exec = exec;
exports.setup_dvc = setup_dvc;
