/**
 * services/blockchain.service.ts — HANYA logika Ethers.js/Polygon di sini (Rule 3)
 *
 * Tidak boleh import xendit, queue, atau logika bisnis lainnya.
 *
 * Responsibilities:
 *   1. Connect ke Polygon Amoy via ethers.js
 *   2. Record Merkle Root harian ke NemosEscrowLedger
 *   3. Record Tranche release ke NemosEscrowLedger
 *   4. Enforce Rule 7 (Relayer Wallet Safety) sebelum setiap TX
 *
 * Contract functions (verified from NemosEscrowLedger.sol):
 *   - recordDailyMerkleRoot(uint256 _dayNumber, bytes32 _merkleRoot, uint256 _txCount)
 *   - releaseTranche(bytes32 _umkmId, bytes32 _trancheId, uint256 _amountIdr, uint8 _trancheStage, uint8 _aiScore)
 */
import { ethers } from "ethers";
import { env } from "../config/env";

// ── CONTRACT ABI (minimal — hanya fungsi yang dipanggil backend) ──
const NEMOS_ESCROW_ABI = [
  // Write functions (onlyRelayer)
  "function recordDailyMerkleRoot(uint256 _dayNumber, bytes32 _merkleRoot, uint256 _txCount) external",
  "function releaseTranche(bytes32 _umkmId, bytes32 _trancheId, uint256 _amountIdr, uint8 _trancheStage, uint8 _aiScore) external",
  // Read functions (public)
  "function dailyMerkleRoots(uint256) view returns (bytes32)",
  "function isTrancheRecorded(bytes32 _trancheId) view returns (bool)",
  "function disbursementCount() view returns (uint256)",
];

// ── PROVIDER & WALLET SETUP ──────────────────────────────
const provider = new ethers.JsonRpcProvider(env.POLYGON_AMOY_RPC);
const relayerWallet = new ethers.Wallet(env.RELAYER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  env.NEMOS_CONTRACT_ADDRESS,
  NEMOS_ESCROW_ABI,
  relayerWallet
);

console.log(`[BLOCKCHAIN] Relayer address: ${relayerWallet.address}`);
console.log(`[BLOCKCHAIN] Contract address: ${env.NEMOS_CONTRACT_ADDRESS}`);

// ── RULE 7: RELAYER WALLET SAFETY CHECK ──────────────────
/**
 * Performs all 5 safety checks before a blockchain TX (Rule 7):
 * 1. getBalance() — check current balance
 * 2. estimateGas() — actual gas estimation
 * 3. getFeeData() — current gas price
 * 4. Safety check: balance < gasCost * 2n → throw
 * 5. Upper limit: balance > 5 MATIC → warn
 *
 * @param estimatedGas - Gas estimate from contract.functionName.estimateGas()
 * @returns The fee data for use in the TX
 */
async function relayerSafetyCheck(estimatedGas: bigint): Promise<ethers.FeeData> {
  // Step 1: Get current balance
  const balance = await provider.getBalance(relayerWallet.address);
  console.log(`[BLOCKCHAIN] Relayer balance: ${ethers.formatEther(balance)} MATIC`);

  // Step 2: Upper limit warning (Gemini audit recommendation)
  if (balance > ethers.parseEther("5")) {
    console.warn(
      `[BLOCKCHAIN] ⚠️ Relayer wallet balance exceeds 5 MATIC safety limit. ` +
      `Current: ${ethers.formatEther(balance)} MATIC. ` +
      `Only keep gas money in this wallet.`
    );
  }

  // Step 3: Get current fee data
  const feeData = await provider.getFeeData();
  if (!feeData.gasPrice) {
    throw new Error("[BLOCKCHAIN] Cannot get gas price from network. Aborting TX.");
  }

  // Step 4: Calculate total gas cost with 2x safety buffer
  const gasCost = estimatedGas * feeData.gasPrice;
  if (balance < gasCost * 2n) {
    throw new Error(
      `CRITICAL: Relayer wallet balance insufficient.\n` +
      `Balance: ${ethers.formatEther(balance)} MATIC\n` +
      `Estimated gas: ${estimatedGas.toString()} units\n` +
      `Gas price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei\n` +
      `Required (2x safety): ${ethers.formatEther(gasCost * 2n)} MATIC\n` +
      `Relayer address: ${relayerWallet.address}\n` +
      `Action: Top up relayer wallet immediately.`
    );
  }

  console.log(
    `[BLOCKCHAIN] Gas check passed — ` +
    `estimated: ${estimatedGas.toString()} units, ` +
    `cost: ${ethers.formatEther(gasCost)} MATIC, ` +
    `balance: ${ethers.formatEther(balance)} MATIC`
  );

  return feeData;
}

// ── RECORD MERKLE ROOT ───────────────────────────────────
/**
 * Record daily Merkle root to NemosEscrowLedger.
 *
 * @param dayNumber  - Day number (timestamp / 86400)
 * @param merkleRoot - bytes32 Merkle root hash
 * @param txCount    - Number of transactions in the batch
 * @returns Transaction hash from Polygon
 */
export async function recordMerkleRoot(
  dayNumber: number,
  merkleRoot: string,
  txCount: number
): Promise<string> {
  console.log(`[BLOCKCHAIN] Recording Merkle root for day ${dayNumber}...`);
  console.log(`[BLOCKCHAIN] Merkle root: ${merkleRoot}, TX count: ${txCount}`);

  // Rule 7 Step 2: Estimate gas BEFORE sending TX
  const gasEstimate = await contract.recordDailyMerkleRoot.estimateGas(
    dayNumber,
    merkleRoot,
    txCount
  );

  // Rule 7: Full safety check
  await relayerSafetyCheck(gasEstimate);

  // Send TX (all safety checks passed)
  const tx = await contract.recordDailyMerkleRoot(
    dayNumber,
    merkleRoot,
    txCount
  );

  console.log(`[BLOCKCHAIN] TX sent: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`[BLOCKCHAIN] ✅ Merkle root confirmed in block ${receipt.blockNumber}`);

  return tx.hash;
}

// ── RECORD TRANCHE RELEASE ───────────────────────────────
/**
 * Record tranche release (disbursement) to NemosEscrowLedger.
 *
 * @param umkmId       - Database UMKM ID (will be keccak256 hashed)
 * @param trancheId    - Database Tranche ID (will be keccak256 hashed)
 * @param amountIdr    - Amount in Rupiah
 * @param trancheStage - Tranche stage number (1, 2, 3...)
 * @param aiScore      - AI OCR confidence score (0-100)
 * @returns Transaction hash from Polygon
 */
export async function recordTranche(
  umkmId: string,
  trancheId: string,
  amountIdr: number,
  trancheStage: number,
  aiScore: number
): Promise<string> {
  console.log(`[BLOCKCHAIN] Recording tranche — UMKM: ${umkmId}, Stage: ${trancheStage}`);

  // Hash string IDs to bytes32 (contract expects bytes32)
  const umkmIdHash = ethers.id(umkmId);
  const trancheIdHash = ethers.id(trancheId);

  // Rule 7 Step 2: Estimate gas BEFORE sending TX
  const gasEstimate = await contract.releaseTranche.estimateGas(
    umkmIdHash,
    trancheIdHash,
    amountIdr,
    trancheStage,
    aiScore
  );

  // Rule 7: Full safety check
  await relayerSafetyCheck(gasEstimate);

  // Send TX (all safety checks passed)
  const tx = await contract.releaseTranche(
    umkmIdHash,
    trancheIdHash,
    amountIdr,
    trancheStage,
    aiScore
  );

  console.log(`[BLOCKCHAIN] TX sent: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`[BLOCKCHAIN] ✅ Tranche confirmed in block ${receipt.blockNumber}`);

  return tx.hash;
}

// ── UTILITY: Get relayer balance ─────────────────────────
export async function getRelayerBalance(): Promise<string> {
  const balance = await provider.getBalance(relayerWallet.address);
  return ethers.formatEther(balance);
}

// ── UTILITY: Get contract stats ──────────────────────────
export async function getContractStats(): Promise<{
  disbursementCount: number;
  relayerAddress: string;
  relayerBalance: string;
}> {
  const [count, balance] = await Promise.all([
    contract.disbursementCount(),
    provider.getBalance(relayerWallet.address),
  ]);

  return {
    disbursementCount: Number(count),
    relayerAddress: relayerWallet.address,
    relayerBalance: ethers.formatEther(balance),
  };
}
