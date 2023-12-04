# Storage Layout Checker

> [!NOTE]
> This version identifies all differences but doesn't escalate and de-escalate findings.

The Storage Layout Checker is a tool meant to simplify contract upgrades. It compares the storage layout between two suite versions and provides insights into the changes.

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

Contracts with identified differences will be listed as `OLD` and `NEW` tables. To examine a finding, open the two files side by side.

Additionally, `removed.txt` file will be created, listing the names of contracts no longer included in the suite.

## Legend

| Emoji | Meaning      |
| ----- | ------------ |
| ❗️     | Questionable |
| 🗑️     | Removed      |
| ✨     | New          |

---

© 2023 PT Services DMCC
