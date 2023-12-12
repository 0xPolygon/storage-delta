# ⟁ Storage Delta &nbsp;&nbsp;[![GitHub Repo stars](https://img.shields.io/github/stars/0xPolygon/storage-delta?style=flat-square&labelColor=black&color=white)](https://github.com/0xPolygon/storage-delta/stargazers)

Storage Delta is a tool for inspecting storage layout changes between contract upgrades.

![Demo](./demo.gif)

## Install

To install with [Foundry](https://github.com/foundry-rs/foundry):

```bash
forge install 0xPolygon/storage-delta
```

## Usage

Storage Delta compares the entire suite to any previous version.

```bash
bash lib/storage-delta/run.sh <COMMIT_OR_TAG>
```

`./storage_delta` will be generated if there are findings. Open `OLD` and `NEW` files side by side for the best experience.

## Findings

|     | Finding                                    |
| --- | ------------------------------------------ |
| 🌱   | [New](#new)                                |
| 🏴   | [Problematic](#problematic)                |
| 🏳️   | [Moved](#moved)                            |
| 🏁   | [Moved & problematic](#moved--problematic) |
| 🪦   | [Removed](#removed)                        |
|     | [Dirty bytes](#dirty-bytes)                |


### New

When a variable with a unique name and type is added.

```solidity
    uint256 a
```

```solidity
    uint256 a
🌱  bool b
```

### Problematic

When a new variable is added, but it conflicts with the existing storage.

```solidity
    uint256 a
```

```solidity
🏴  bool b
```

### Moved

When an existing variable is moved.

```solidity
    uint256 a
    ...
```

```solidity
    ...
🏳️  uint256 a 
```

### Moved & problematic

When an existing variable is moved and conflicts with the existing storage.

```solidity
    uint256 a
    bool b
```

```solidity
🏁  bool b 
🏁  uint256 a
```

### Removed

When a variable no longer exists.

```solidity
    uint256 a
    bool b
```

```solidity
    uint256 a
🪦
```

### Dirty bytes


When the storage is not clean.

```solidity
    uint256 a
```

```solidity
🏴  uint128 a
    16 dirty bytes
```

## Requirements

Files should be named after the contract they hold. `Example` → `Example.sol`

The script utilizes Node.js to run. We recommend the node version defined in the `.nvmrc` file.

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
