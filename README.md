# DVC Action V1

This action installs [DVC](https://dvc.org/) so your workflow can access it.
It automatically uninstalls previous DVC installations.

It requires Python 3. You can install it on your own or use
[setup-python](https://github.com/actions/setup-python).

# Usage

See action.yml

Basic:

```yaml
steps:
  - uses: actions/checkout@v2

  - uses: actions/setup-python@v2
    with:
      python-version: '3.x'

  - uses: iterative/dvc-action@version-1
    with:
      version: latest
      remote_driver: 'all'

  - run: dvc version
```

# Additional

- Tested on Linux and MacOS, not yet tested on Windows.
