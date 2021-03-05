# Setup DVC Action

![DVC](https://user-images.githubusercontent.com/414967/90413385-a8d9d180-e0ae-11ea-9ed7-a9155a3b48f0.png)

The [`iterative/setup-dvc`](https://github.com/iterative/setup-dvc) action is a
TypeScript action that sets up [DVC](https://dvc.org/) in your workflow.

**Data Version Control** or **DVC** is an **open-source** tool for data science
and machine learning projects.

#### Key features

1. Simple **command line** Git-like experience. Does not require installing and
   maintaining any databases. Does not depend on any proprietary online
   services.

2. Management and versioning of **datasets** and **machine learning models**.
   Data is saved in S3, Google cloud, Azure, Alibaba cloud, SSH server, HDFS, or
   even local HDD RAID.

3. Makes projects **reproducible** and **shareable**; helping to answer
   questions about how a model was built.

4. Helps manage experiments with Git tags/branches and **metrics** tracking.

**DVC** aims to replace spreadsheet and document sharing tools (such as Excel or
Google Docs) which are being used frequently as both knowledge repositories and
team ledgers. DVC also replaces both ad-hoc scripts to track, move, and deploy
different model versions; as well as ad-hoc data file suffixes and prefixes.

## Usage

This action can be run on `ubuntu-latest`, `macos-latest` and `windows-latest`.

#### Basic usage

```yaml
steps:
  - uses: actions/setup-python@v2
  - uses: iterative/setup-dvc@v2
  - run: dvc --help
```

#### Version pinning

```yaml
steps:
  - uses: actions/setup-python@v2
  - uses: iterative/setup-dvc@v2
    with:
      version: '1.0.1'
```

## Inputs

- **`version`** _(optional)_ The version of DVC to install; defaults to **latest**.

## Outputs

This action has no outputs.
