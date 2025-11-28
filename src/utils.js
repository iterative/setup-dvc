import { promisify } from 'util';
import { createWriteStream } from 'fs';
import { unlink, mkdtemp, access } from 'fs/promises';
import * as core from '@actions/core';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { exec as execSync, spawn } from 'child_process';
import { tmpdir } from 'os';

const execp = promisify(execSync);
export const exec = async (command, opts = {}) => {
  const { stdout, stderr } = await execp(command, opts);
  return (stdout || stderr).slice(0, -1);
};

export const execInteractive = async (command, args = [], opts = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...opts
    });
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

export const getOrInstallUv = async () => {
  if (await isUvInstalled()) {
    return 'uv';
  }
  const tmpBase = await mkdtemp(path.join(tmpdir(), 'uv-setup-dvc'));
  const installDir = path.join(tmpBase, 'install');
  const isWindows = process.platform === 'win32';

  const env = {
    ...process.env,
    UV_UNMANAGED_INSTALL: installDir
  };
  const scriptSource = isWindows
    ? 'https://astral.sh/uv/install.ps1'
    : 'https://astral.sh/uv/install.sh';
  const scriptPath = path.join(tmpBase, path.basename(scriptSource));
  await download(scriptSource, scriptPath);
  await access(scriptPath);

  const [command, args] = isWindows
    ? [`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, []]
    : ['sh', [scriptPath]];
  await core.group(`Installing uv`, () =>
    execInteractive(command, args, { env })
  );
  await unlink(scriptPath);

  const uvPath = path.join(installDir, isWindows ? 'uv.exe' : 'uv');
  await access(uvPath);
  return uvPath;
};

export const installWithUv = async version => {
  const uvCmd = await getOrInstallUv();
  const pkg = `dvc[all]${version === 'latest' ? '' : `==${version}`}`;
  core.debug('uvCmd:', uvCmd);
  const uvToolDir = await mkdtemp(path.join(tmpdir(), 'setup-dvc'));
  const env = { ...process.env, UV_TOOL_DIR: uvToolDir };
  await core.group(`Installing '${pkg}' using uv`, () =>
    execInteractive(`${uvCmd} tool install --upgrade --force ${pkg}`, [], {
      env
    })
  );
  core.addPath(uvToolDir);
};

export const setupDVC = async opts => {
  await installWithUv(opts.version);
};
