const core = require('@actions/core');
const { setup_dvc } = require('./utils');

(async () => {
  try {
    const version = core.getInput('version');
    await setup_dvc({ version });
  } catch (error) {
    core.setFailed(error.message);
  }
})();
