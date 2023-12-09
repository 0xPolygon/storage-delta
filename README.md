# Storage Layout Checker

The Storage Layout Checker is a tool to inspect changes made to the storage layout between different versions of a smart contract during the development cycle. The tool will compare the storage layout of the contracts in the current commit with the storage layout of the contracts in a specified commit or tag.

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

| Emoji | Meaning         |
| ----- | --------------- |
| 🏴    | Dirty           |
| 🏳️    | Moved           |
| 🏁    | Dirty and Moved |
| 🪦    | Removed         |
| 🌱    | New             |

### Dirty

A variable is considered dirty if the name or type of the variable changes. A dirty variable can also be a new variable that conflicts with the previous storage layout.

### Moved

A variable with the same name and type moved to a new storage slot, but it doesn't conflict with the previous storage layout.

### Dirty and Moved

When a variable is both dirty and moved, it means that the variable has moved to a new storage slot and is conflicting with the previous storage layout.

### Removed

This variable no longer exists in the new version of the contract.

### New

This variable is new in the new version of the contract. Note, when a new contract is added that has a private variable as another contract with the same private variable name and type, it will be flagged as potentially moved.

## Upcoming Features

- **Support for Special Variables**: Adds support for `__gap` and `__legacy` variables.

## License

​
Licensed under either of
​

- Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)
  ​

at your option.

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

---

© 2023 PT Services DMCC
