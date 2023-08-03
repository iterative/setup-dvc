const core = require('@actions/core');
const { setupDVC, prepGitRepo } = require('./utils');

(async () => {
  try {
    const version = core.getInput('version');
    const remoteDriver = core.getInput('remote_driver');
    await setupDVC({ version, remoteDriver });
    try {
      await prepGitRepo();
    } catch (err) {
      core.warning(
        'error while preparing git repo for full dvc usage, you may need to install cml and run `cml ci` for commands like `dvc exp save`.'
      );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
