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
  const { version } = await response.json();

  return version;
};

const prepGitRepo = async () => {
  console.log('*** prepGitRepo ***');
  const repo = await exec(`git config --get remote.origin.url`);
  console.log(`repo: ${repo}`);
  const rawToken = await exec(
    `git config --get "http.https://github.com/.extraheader"`
  );
  console.log(`rawToken: ${rawToken}`);
  // format of rawToken "AUTHORIZATION: basic ***"
  const [, , token] = rawToken.split(' ');
  console.log(`token: ${token}`);
  const newURL = new URL(repo);
  newURL.password = token;
  newURL.username = 'token';
  const finalURL =
    newURL.toString() + (newURL.toString().endsWith('.git') ? '' : '.git');
  console.log(`finalURL: ${finalURL}`);
  await exec(`git remote set-url origin "${finalURL}"`);
  console.log('*** prepGitRepo done ***');
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
