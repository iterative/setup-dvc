const util = require('util');
const fs = require('fs');
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

const download = async (url, path) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    if (res.status !== 200) return reject(new Error(res.statusText));
    console.log(res.status);
    console.log(res);
    res.body.pipe(fileStream);
    res.body.on('error', err => {
      reject(err);
    });
    fileStream.on('finish', function() {
      resolve();
    });
  });
};

const getLatestVersion = async () => {
  const endpoint = 'https://updater.dvc.org';
  const response = await fetch(endpoint, { method: 'GET' });
  const { version } = await response.json();

  return version;
};

const setupDVC = async opts => {
  const { platform } = process;
  let { version = 'latest' } = opts;
  if (version === 'latest') {
    version = await getLatestVersion();
  }

  if (platform === 'linux') {
    let sudo = '';
    try {
      sudo = await exec('which sudo');
    } catch (err) {}
    try {
      await download(
        `https://dvc.org/download/linux-deb/dvc-${version}`,
        'dvc.deb'
      );
    } catch (err) {
      // fallback to GH releases
      await download(
        `https://github.com/iterative/dvc/releases/download/${version}/dvc_${version}_amd64.deb`,
        'dvc.deb'
      );
    }
    console.log(
      await exec(
        `${sudo} apt update && ${sudo} apt install -y --allow-downgrades git ./dvc.deb && ${sudo} rm -f 'dvc.deb'`
      )
    );
  }

  if (platform === 'darwin') {
    try {
      console.log('1 attempt');
      await download(`https://dvc.org/download/osx/dvc-${version}`, 'dvc.pkg');
      console.log(await exec('cat dvc.pkg'));
    } catch (err) {
      // fallback to GH releases
      console.log('2 attempt');
      await download(
        `https://github.com/iterative/dvc/releases/download/${version}/dvc-${version}.pkg`,
        'dvc.pkg'
      );
    }
    console.log(
      await exec(`sudo installer -pkg "dvc.pkg" -target / && rm -f "dvc.pkg"`)
    );
  }

  if (platform === 'win32') {
    console.log(
      await exec(
        `pip install --upgrade dvc[all]${
          version !== 'latest' ? `==${version}` : ''
        }`
      )
    );
  }
};

exports.exec = exec;
exports.setupDVC = setupDVC;
