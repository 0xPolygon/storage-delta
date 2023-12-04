# Storage Layout Checker

> [!NOTE]
> V1 identifies all differences but doesn't escalate and de-escalate findings.

Storage Layout Checker is made to simplify contract upgrades. It compares the storage layout between two suite versions and provides insights into the changes.

## Upcoming Features

### V2

- **Enhanced Detection:** Properly escalates and de-escalates findings.
- **Dirty Bits Visibility:** Shows where dirty bits are.

### V3

- **Support for Special Fields**: Adds support for `__gap` and `__legacy` naming.

### CI

- **CI Integration**: Runs on code push and PR.

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

Additionally, `removed.txt` file will be created, with the names of removed contracts.

## Legend

| Emoji | Meaning      |
| ----- | ------------ |
| ❗️     | Questionable |
| 🗑️     | Removed      |
| ✨     | New          |

---

© 2023 PT Services DMCC
