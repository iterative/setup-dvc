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
  if (response.ok) {
    const { version } = await response.json();
    return version;
  } else {
    const status = `Status: ${response.status} ${response.statusText}`;
    const body = `Body:\n${await response.text()}`;
    throw new Error(`${status}\n${body}`);
  }
};

const prepGitRepo = async () => {
  const repo = await exec(`git config --get remote.origin.url`);
  const rawToken = await exec(
    `git config --get "http.https://github.com/.extraheader"`
  );
  // format of rawToken "AUTHORIZATION: basic ***"
  const [, , token64] = rawToken.split(' ');
  // eC1hY2Nlc3MtdG9rZW46Z2hzX ...
  const token = Buffer.from(token64, 'base64')
    .toString('utf-8')
    .split(':')
    .pop();
  // x-access-token:ghs_***
  const newURL = new URL(repo);
  newURL.password = token;
  newURL.username = 'token';
  const finalURL =
    newURL.toString() + (newURL.toString().endsWith('.git') ? '' : '.git');
  await exec(`git remote set-url origin "${finalURL}"`);
  await exec(`git config --unset "http.https://github.com/.extraheader"`);
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
      const dvcURL = `https://dvc.org/download/linux-deb/dvc-${version}`;
      console.log(`Installing DVC from: ${dvcURL}`);
      await download(dvcURL, 'dvc.deb');
    } catch (err) {
      console.log('DVC Download Failed, trying from GitHub Releases');
      const dvcURL = `https://github.com/iterative/dvc/releases/download/${version}/dvc_${version}_amd64.deb`;
      console.log(`Installing DVC from: ${dvcURL}`);
      await download(dvcURL, 'dvc.deb');
    }
    console.log(
      await exec(
        `${sudo} apt update && ${sudo} apt install -y --allow-downgrades git ./dvc.deb && ${sudo} rm -f 'dvc.deb'`
      )
    );
  }

  if (platform === 'darwin') {
    try {
      const dvcURL = `https://dvc.org/download/osx/dvc-${version}`;
      console.log(`Installing DVC from: ${dvcURL}`);
      await download(dvcURL, 'dvc.pkg');
    } catch (err) {
      console.log('DVC Download Failed, trying from GitHub Releases');
      const dvcURL = `https://github.com/iterative/dvc/releases/download/${version}/dvc-${version}.pkg`;
      console.log(`Installing DVC from: ${dvcURL}`);
      await download(dvcURL, 'dvc.pkg');
    }
    console.log(
      await exec(`sudo installer -pkg "dvc.pkg" -target / && rm -f "dvc.pkg"`)
    );
  }

  if (platform === 'win32') {
    console.log('Installing DVC with pip');
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
exports.prepGitRepo = prepGitRepo;
