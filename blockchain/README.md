# Blockchain — NEMOS Smart Contract

Hardhat project untuk NemosEscrowLedger di Polygon Amoy Testnet.

## Deployed Contract

| Item | Value |
|---|---|
| **Address** | `0x1aa24060c4Cc855b8437DBA3b592647C43c87012` |
| **Network** | Polygon Amoy (chainId: 80002) |
| **Explorer** | [View on Polygonscan](https://amoy.polygonscan.com/address/0x1aa24060c4Cc855b8437DBA3b592647C43c87012) |
| **Verified** | ✅ |
| **Tests** | 29/29 passing |

## Tech Stack

- **Framework**: Hardhat 2.22
- **Language**: Solidity 0.8.24
- **Libraries**: OpenZeppelin (Ownable, Pausable, ReentrancyGuard)
- **Network**: Polygon Amoy Testnet

## Contract Functions

### Write (onlyRelayer)
- `recordDailyMerkleRoot(dayNumber, merkleRoot, txCount)` — Catat Merkle root harian
- `releaseTranche(umkmId, trancheId, amountIdr, stage, aiScore)` — Catat pencairan

### Admin (onlyOwner)
- `updateRelayer(newAddress)` — Ganti relayer wallet
- `pause()` / `unpause()` — Emergency stop

### View (public)
- `verifyMerkleProof(day, proof, leaf)` — Verifikasi audit trail
- `getDisbursement(id)` / `getMerkleRoot(day)`
- `isTrancheRecorded(trancheId)`

## Setup

```bash
npm install
cp .env.example .env
# Edit .env

# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy (jika perlu redeploy)
npx hardhat run scripts/deploy.ts --network amoy
```

## Environment Variables

| Variable | Deskripsi |
|---|---|
| `POLYGON_AMOY_RPC` | Alchemy RPC URL |
| `RELAYER_PRIVATE_KEY` | Private key wallet relayer |
| `POLYGONSCAN_API_KEY` | Untuk auto-verify |
