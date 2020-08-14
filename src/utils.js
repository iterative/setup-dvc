const util = require('util');
const fetch = require('node-fetch');

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

const get_latest_version = async () => {
  const endpoint = 'https://api.github.com/repos/iterative/dvc/releases/latest';
  const response = await fetch(endpoint, { method: 'GET' });
  const { tag_name } = await response.json();

  return tag_name;
};

const setup_dvc = async opts => {
  const { platform } = process;
  let { version = 'latest' } = opts;
  if (version === 'latest') {
    version = await get_latest_version();
  }

  if (platform === 'linux') {
    let sudo = '';
    try {
      sudo = await exec('which sudo');
    } catch (err) {}

    console.log(
      await exec(
        `${sudo} curl 'https://github.com/iterative/dvc/releases/download/${version}/dvc_${version}_amd64.deb' --output 'dvc.deb'  && \
      ${sudo} dpkg -i 'dvc.deb' && \
      ${sudo} rm -f 'dvc.deb'`
      )
    );
  }

  if (platform === 'darwin') {
    console.log(
      await exec(
        `wget -O "dvc.pkg" 'https://github.com/iterative/dvc/releases/download/${version}/dvc-${version}.pkg' && \
        sudo installer -pkg "dvc.pkg" -target / && \
        rm -f "dvc.pkg"`
      )
    );
  }

  if (platform === 'win32') {
    console.log(
      await exec(
        `pip install --upgrade dvc${version !== 'latest' ? `==${version}` : ''}`
      )
    );
  }
};

exports.exec = exec;
exports.setup_dvc = setup_dvc;
