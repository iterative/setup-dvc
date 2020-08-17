# Setup DVC Action

![DVC](https://user-images.githubusercontent.com/414967/90413385-a8d9d180-e0ae-11ea-9ed7-a9155a3b48f0.png)

[DVC](https://dvc.org/) is an open-source Version Control System for Machine
Learning Projects. [DVC](https://dvc.org/) is built to make ML models shareable
and reproducible. It is designed to handle large files, data sets, machine
learning models, and metrics as well as code.

The [iterative/setup-dvc](https://github.com/iterative/setup-dvc) action is a
JavaScript action that sets up [DVC](https://dvc.org/) in your GitHub Actions
workflow. It installs the specified version by `version` action input parameter.

## Usage

This action can be run on `ubuntu-latest`, `macos-latest`, `windows-latest`.
When running on `windows-latest` python3 is needed in order to set up the
action.

Basic:

```yaml
steps:
  - uses: actions/checkout@v2

  - uses: iterative/setup-dvc@v1
```

Windows:

```yaml
steps:
  - uses: actions/checkout@v2

  - uses: actions/setup-python@v2
    with:
      python-version: '3.x'

  - uses: iterative/setup-dvc@v1
```

A specific version can be pinned to your workflow.

```yaml
steps:
  - uses: actions/checkout@v2

  - uses: iterative/setup-dvc@v1
    with:
      version: '1.0.1'
```

## Inputs

The following inputs are supported.

- `version` - (optional) The version of DVC to install. A value of `latest` will
  install the latest version of DVC. Defaults to `latest`.

## Outputs

Setup DVC has no outputs.
