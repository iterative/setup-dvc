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

  let sudo = '';
  try {
    sudo = await exec('which sudo');
  } catch (err) {}

  if (process.platform === 'linux');
  console.log(
    await exec(`${sudo} wget https://dvc.org/deb/dvc.list -O /etc/apt/sources.list.d/dvc.list && \
      ${sudo} apt update && \
      ${sudo} apt -y install dvc${version !== 'latest' ? `=${version}` : ''}`)
  );

  if (process.platform === 'darwin');
  console.log(
    await exec(
      `${sudo} brew install dvc${version !== 'latest' ? `@${version}` : ''}`
    )
  );

  if (process.platform === 'win32');
  console.log(
    await exec(
      `choco install dvc${version !== 'latest' ? ` --version ${version}` : ''}`
    )
  );
};

exports.exec = exec;
exports.setup_dvc = setup_dvc;
