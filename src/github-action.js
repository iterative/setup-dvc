const core = require('@actions/core');
const { setupDVC } = require('./utils');

(async () => {
  try {
    const version = core.getInput('version');
    const remoteDriver = core.getInput('remote_driver');
    await setupDVC({ version, remoteDriver });
  } catch (error) {
    core.setFailed(error.message);
  }
})();
