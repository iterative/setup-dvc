import { promisify } from 'node:util';
import { createWriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import * as core from '@actions/core';
import path from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { exec as execCb, spawn } from 'node:child_process';

const execp = promisify(execCb);
export const exec = async (command, opts) => {
  const { debug } = opts || {};
  try {
    const { stdout, stderr } = await execp(command);
    if (debug) {
      console.log(`\nCommand: ${command}\n\t${stdout}\n\t${stderr}`);
    }
    return (stdout || stderr).slice(0, -1);
  } catch (error) {
    if (debug) {
      console.log(
        `\nCommand: ${command}\n\t${error.stdout}\n\t${error.stderr}`
      );
    }
    throw error;
  }
};

export const execInteractive = async (command, args = []) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true });
    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`Command failed with exit code ${code}`));
      }
      resolve(code);
    });
  });

export const download = async (url, path) => {
  const res = await fetch(url);
  if (res.status !== 200) {
    throw new Error(res.statusText);
  }

  const body = Readable.fromWeb(res.body);
  const fileStream = createWriteStream(path);
  await finished(body.pipe(fileStream));
};

const downloadWithFallback = async (urls, dest) => {
  if (urls.length === 0) {
    throw new Error('No URLs provided for download');
  }
  let lastError = null;
  for (const url of urls) {
    core.debug(`Downloading from ${url}`);
    try {
      await download(url, dest);
      return { source: url };
    } catch (err) {
      lastError = err;
      core.debug(`Download failed: ${err}`);
      try {
        await unlink(dest);
      } catch (err) {}
    }
  }
  throw lastError;
};

const getLatestVersion = async () => {
  const endpoint = 'https://updater.dvc.org';
  const response = await fetch(endpoint, { method: 'GET' });
  if (response.ok) {
    const { version } = await response.json();
    return version;
  }
  const status = `Status: ${response.status} ${response.statusText}`;
  const body = `Body:\n${await response.text()}`;
  throw new Error(`${status}\n${body}`);
};

export const prepGitRepo = async () => {
  const repo = await exec(`git config --get remote.origin.url`);
  const rawToken = await exec(
    `git config --get "http.https://github.com/.extraheader"`
  );
  // Format of rawToken "AUTHORIZATION: basic ***"
  const [, , token64] = rawToken.split(' ');
  // EC1hY2Nlc3MtdG9rZW46Z2hzX ...
  const token = Buffer.from(token64, 'base64')
    .toString('utf-8')
    .split(':')
    .pop();
  // X-access-token:ghs_***
  const newURL = new URL(repo);
  newURL.password = token;
  newURL.username = 'token';
  const finalURL =
    newURL.toString() + (newURL.toString().endsWith('.git') ? '' : '.git');
  await exec(`git remote set-url origin "${finalURL}"`);
  await exec(`git config --unset "http.https://github.com/.extraheader"`);
};

const isUvInstalled = async () => {
  try {
    await exec('uv --version');
    return true;
  } catch (error) {
    return false;
  }
};

export const installPythonPackage = async version => {
  const pkg = `dvc[all]${version === 'latest' ? '' : `==${version}`}`;
  const uvInstalled = await isUvInstalled();
  const installer = uvInstalled ? 'uv' : 'pip';
  const installerCmd = uvInstalled
    ? `uv tool install --upgrade ${pkg}`
    : `pip install --upgrade ${pkg}`;
  await core.group(`Installing '${pkg}' using ${installer}`, () =>
    execInteractive(installerCmd)
  );
};

export const setupDVC = async opts => {
  const { arch, platform } = process;
  let { version = 'latest' } = opts;
  if (version === 'latest') {
    version = await getLatestVersion();
    core.debug(`Using latest DVC version: ${version}`);
  }

  if (platform === 'linux' && arch === 'x64') {
    let sudo = '';
    try {
      sudo = await exec('which sudo');
    } catch (err) {}
    const { source } = await downloadWithFallback(
      [
        `https://dvc.org/download/linux-deb/dvc-${version}`,
        `https://github.com/treeverse/dvc/releases/download/${version}/dvc_${version}_amd64.deb`
      ],
      'dvc.deb'
    );
    await core.group(`Installing dvc from ${source}`, () =>
      execInteractive(`${sudo} apt-get install ./dvc.deb`)
    );
    await unlink('dvc.deb');
    return;
  }

  if (platform === 'darwin') {
    const { source } = await downloadWithFallback(
      [
        `https://dvc.org/download/osx/dvc-${version}`,
        `https://github.com/treeverse/dvc/releases/download/${version}/dvc-${version}.pkg`
      ],
      'dvc.pkg'
    );
    await core.group(`Installing dvc from ${source}`, () =>
      execInteractive(`sudo installer -pkg "dvc.pkg" -target /`)
    );
    await unlink('dvc.pkg');
    return;
  }

  if (platform === 'win32') {
    const { source } = await downloadWithFallback(
      [
        `https://dvc.org/download/win/dvc-${version}`,
        `https://github.com/treeverse/dvc/releases/download/${version}/dvc-${version}.exe`
      ],
      'dvc.exe'
    );
    await core.group(`Installing dvc from ${source}`, () =>
      execInteractive(
        `powershell -c "Start-Process -FilePath .\\dvc.exe -ArgumentList '/SP- /NORESTART /SUPPRESSMSGBOXES /VERYSILENT' -NoNewWindow -Wait"`
      )
    );
    await unlink('dvc.exe');
    const programFilesPath = 'C:\\Program Files (x86)';
    const installDir = 'DVC (Data Version Control)';
    core.addPath(path.join(programFilesPath, installDir));
    return;
  }

  // Install DVC via pip on other platforms and architectures
  await installPythonPackage(version);
};
