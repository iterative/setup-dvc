const core = require('@actions/core');
const { setup_dvc } = require('./utils');

(async () => {
  try {
    const version = core.getInput('version');
    const remote_driver = core.getInput('remote_driver');
    await setup_dvc({ version, remote_driver });
  } catch (error) {
    core.setFailed(error.message);
  }
})();
