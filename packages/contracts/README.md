# 📦 `@autohodl.money/contracts`

This package contains the **smart contracts** that power the **autoHODL** protocol.

---

## 📁 Project Structure

```
packages/contracts/
├── src/
│   ├── AutoHodl.sol
│   ├── delegates/
│   │   └── MMCardDelegate.sol
│   ├── interfaces/
│   │   ├── IDelegate.sol
│   │   ├── IERC20.sol
│   │   ├── ILockerPool.sol
│   │   ├── ILockerRouter.sol
│   │   └── IVenueAdapter.sol
│   └── yield/
│       ├── LockerRouter.sol
│       ├── LockerSYT.sol
│       └── adapters/
│           └── AAVEAdapter.sol
├── script/
├── test/
├── lib/
├── foundry.toml
└── package.json
```

---

## 🛠️ Getting Started

### Requirements

- [Foundry](https://book.getfoundry.sh/) (forge, cast, anvil)
- Node.js (>= 16.x) for TypeScript tooling
- `.env` file with RPC keys and private key for deployment

### Install Dependencies

```sh
cd packages/contracts
forge install
```

---

## 📘 Build

```sh
forge build
```

---

## 🧪 Testing

```sh
forge test
```

Run with verbosity for detailed output:

```sh
forge test -vvv
```

---

## 📝 Formatting

Format Solidity files:

```sh
forge fmt
```

---

## 🚀 Deployment

### Deploy AutoHodl Contract

```sh
forge script script/DeployAutoHodl.s.sol:DeployAutoHodl \
  --rpc-url <your_rpc_url> \
  --private-key <your_private_key> \
  --broadcast \
  --etherscan-api-key <your_etherscan_api_key> \
  --verify
```

### Deploy MMCardDelegate Contract

```sh
forge script script/DeployDelegate.s.sol:DeployDelegate \
  --rpc-url <your_rpc_url> \
  --private-key <your_private_key> \
  --broadcast \
  --etherscan-api-key <your_etherscan_api_key> \
  --verify
```

### Deploy LockerRouter

```sh
forge script script/LockerRouter.s.sol:LockerRouterScript \
  --rpc-url <your_rpc_url> \
  --private-key <your_private_key> \
  --broadcast \
  --etherscan-api-key <your_etherscan_api_key> \
  --verify
```

### Setup Adapter

```sh
forge script script/SetupAdapter.s.sol:SetupAdapterScript \
  --rpc-url <your_rpc_url> \
  --private-key <your_private_key> \
  --broadcast \
  --etherscan-api-key <your_etherscan_api_key> \
  --verify
```

---

## 📁 Deployment Scripts

| Script | Description |
|--------|-------------|
| `DeployAutoHodl.s.sol` | Deploys the main AutoHodl contract |
| `DeployDelegate.s.sol` | Deploys and verifies MMCardDelegate |
| `LockerRouter.s.sol` | Deploys the LockerRouter |
| `SetupAdapter.s.sol` | Sets up yield adapter configuration |
| `SetupSYT.s.sol` | Sets up SYT token for an asset |
| `Deposit.s.sol` | Test deposit script |

---

## 📜 License

UNLICENSED

---