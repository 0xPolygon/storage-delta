# Storage Layout Checker

Storage Layout Checker is made to simplify contract upgrades. It compares the storage layout between two suite versions and provides insights into the changes.

> [!NOTE]
> V1 identifies all differences but doesn't escalate and de-escalate findings.

## Upcoming Features

### V2

- **Enhanced Detection:** Properly escalates and de-escalates findings.
- **Dirty Bits Visibility:** Shows where dirty bits are.

### V3

- **Support for Special Variables**: Adds support for `__gap` and `__legacy` variables.

### CI

- **CI Integration**: Runs on push and pull requests.

## Requirements

The script utilizes Node.js to run. We recommend the node version defined in the `.nvmrc` file.

## Installation

```bash
forge install 0xPolygon/storage-layout-checker
```

## Usage Example

The following command will create `storage_check_report` in your project's root directory:

```bash
bash lib/storage-layout-checker/run.sh <COMMIT_OR_TAG>
```

Contracts with identified differences will be listed as `OLD` and `NEW` table files. To examine a finding, open the two files side by side.

Additionally, `removed.txt` file will be created, with the names of deleted contracts.

## Legend

| Emoji | Meaning     |
| ----- | ----------- |
| ❗️    | Problematic |
| 🗑️    | Deleted     |
| ✨    | New         |

---

© 2023 PT Services DMCC
