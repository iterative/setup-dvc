const {exec} = require('./utils');

describe('exec tests', () => {
  test('exec is await and outputs hello', async () => {
    const output = await exec('echo hello');
    expect(output).toMatch('hello');
  });

  test('Command rejects if failure', async () => {
    let error;
    try {
      await exec('this_command_fails');
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
  });
});
