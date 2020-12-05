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

## Using DVC with external storage in GitHub Actions
When you use the `setup-dvc` Action, you can connect datasets and models in external storage to your GitHub Actions runner. Here's an example using AWS S3 storage with DVC in a workflow:

```yaml
name: pull-my-data
on: [push]
jobs:
  run:
    runs-on: [ubuntu-latest]
    steps:
      - uses: actions/checkout@v2
      - uses: iterative/setup-dvc@v1

      - name: "Get my data"
        env:
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          # Pull DVC-tracked artifacts from cloud storage
          dvc pull
          
```

Notice that you'll have to provide environmental variables to the workflow corresponding to your storage type. Here's what you'll need for some of the most popular providers:

<details>
  <summary>
  S3 and S3 compatible storage (Minio, DigitalOcean Spaces, IBM Cloud Object Storage...)
  </summary>

```yaml
# Github
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  AWS_SESSION_TOKEN: ${{ secrets.AWS_SESSION_TOKEN }}
```

> :point_right: AWS_SESSION_TOKEN is optional.

</details>

<details>
  <summary>
  Azure
  </summary>

```yaml
env:
  AZURE_STORAGE_CONNECTION_STRING:
    ${{ secrets.AZURE_STORAGE_CONNECTION_STRING }}
  AZURE_STORAGE_CONTAINER_NAME: ${{ secrets.AZURE_STORAGE_CONTAINER_NAME }}
```

</details>

<details>
  <summary>
  Aliyn
  </summary>

```yaml
env:
  OSS_BUCKET: ${{ secrets.OSS_BUCKET }}
  OSS_ACCESS_KEY_ID: ${{ secrets.OSS_ACCESS_KEY_ID }}
  OSS_ACCESS_KEY_SECRET: ${{ secrets.OSS_ACCESS_KEY_SECRET }}
  OSS_ENDPOINT: ${{ secrets.OSS_ENDPOINT }}
```

</details>

<details>
  <summary>
  Google Storage
  </summary>

> :warning: Normally, GOOGLE_APPLICATION_CREDENTIALS points to the path of the
> json file that contains the credentials. However in the action this variable
> CONTAINS the content of the file. Copy that json and add it as a secret.

```yaml
env:
  GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GOOGLE_APPLICATION_CREDENTIALS }}
```

</details>

<details>
  <summary>
  Google Drive
  </summary>

> :warning: After configuring your
> [Google Drive credentials](https://dvc.org/doc/command-reference/remote/add)
> you will find a json file at
> `your_project_path/.dvc/tmp/gdrive-user-credentials.json`. Copy that json and
> add it as a secret.

```yaml
env:
  GDRIVE_CREDENTIALS_DATA: ${{ secrets.GDRIVE_CREDENTIALS_DATA }}
```

</details>


