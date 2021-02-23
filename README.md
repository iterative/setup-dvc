# Setup DVC Action

![DVC](https://user-images.githubusercontent.com/414967/90413385-a8d9d180-e0ae-11ea-9ed7-a9155a3b48f0.png)

Data version control ([DVC](https://dvc.org/)) is open-source, Git version control for machine learning projects. Benefits include:
- Reproducible and shareable machine learning models and pipelines
- Git version large datasets and models without Git-LFS
- Git diffs for model and data metrics across commits, tags and branches

The [iterative/setup-dvc](https://github.com/iterative/setup-dvc) action is a
JavaScript action that sets up [DVC](https://dvc.org/) in your
workflow. 

## Usage

This action can be run on `ubuntu-latest`, `macos-latest`, `windows-latest`.
When running on `windows-latest`, Python 3 is a dependency that should be setup first (and [there's an action for that](https://github.com/actions/setup-python)).

Basic usage:

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

A specific version can be pinned to your workflow using the `version` argument.

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
