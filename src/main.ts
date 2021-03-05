import {exec} from '@actions/exec'
import {getInput, setFailed} from '@actions/core'
import {join as pathJoin} from 'path'
import {sync as hasbin} from 'hasbin'

async function run(): Promise<void> {
  try {
    const version: string = getInput('version')
    const name: string = version === 'latest' ? 'dvc' : `dvc==${version}`
    await exec(await python(), ['-m', 'pip', 'install', name])
  } catch (error) {
    setFailed(error.message)
  }
}

async function python(): Promise<string> {
  if (process.env.pythonLocation !== undefined)
    return pathJoin(process.env.pythonLocation, 'python')
  else if (hasbin('python')) return 'python'

  throw new Error('Python could not be found, please use actions/setup-python')
}

run()
