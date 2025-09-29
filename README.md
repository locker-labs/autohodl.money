# 🪙 Auto HODL

## 🛠️ Tech Stack

### Core Technologies
* **USDC** – all savings denominated in USDC
* **MetaMask SDK** – wallet connection and user authentication
* **MetaMask DTK** – smart accounts and delegated permissions
* **Aave** – yield generation on deposited savings

### Development Stack
| Layer     | Tech                                  |
| --------- | ------------------------------------- |
| Frontend  | Next.js, Tailwind CSS, Wagmi          |
| Backend   | Next.js, Supabase, Webhooks           |
| Contracts | Solidity, Foundry                     |
| Infra     | Vercel, Supabase, Moralis             |
| Monorepo  | Turborepo, bun                        |

---

## 📦 Monorepo Structure

This project is organized as a **monorepo** to cleanly separate concerns across services and packages:

```
./
│
├── apps/
│   └── web/           # Frontend, Backend (Next.js)
│
├── packages/
│   ├── contracts/     # Smart contracts (Solidity, Foundry)
│   └── scripts/       # Automation scripts (Moralis, etc.)
│
├── .github/           # GitHub workflows (CI/CD)
├── docs/              # Documentation and diagrams
├── package.json       # Monorepo root configuration
└── README.md
```

---

## 🧑‍💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/locker-labs/autohodl.money.git
cd autohodl.money
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Variables

Create `.env` files in `apps/web` and `packages/contracts` as needed.

### 4. Dev Scripts

Run all apps in dev mode:

```bash
bun run dev
```

Build all packages and apps:

```bash
bun run build
```

Or build individually:

```bash
bun run build:contracts
bun run build:web
```

Clean all packages and apps:

```bash
bun run clean
```

---

## 🔐 Smart Contracts

The `contracts` package contains the core logic for savings:

* Written in **Solidity**, tested using **Foundry**.

### Deploy

```bash
cd packages/contracts
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast
```

---

## 📄 License

MIT © 2025 [Locker Labs](https://github.com/locker-labs)