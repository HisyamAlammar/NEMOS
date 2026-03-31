/**
 * services/blockchain.service.ts — Blockchain Relayer Service (Rule 3)
 *
 * HANYA logika blockchain di sini. Tidak boleh import Xendit, BullMQ,
 * atau auth logic apapun.
 *
 * Responsibilities:
 *   1. Connect ke Polygon Amoy via ethers.js
 *   2. recordDailyMerkleRoot() — batch transaksi harian
 *   3. releaseTranche() — catat disbursement on-chain
 *   4. Rule 7: Check relayer MATIC balance sebelum setiap TX
 */
import { ethers } from "ethers";
import { env } from "../config/env";

// ── CONTRACT ABI (hanya fungsi yang kita butuhkan) ────────
const CONTRACT_ABI = [
  // Write functions (onlyRelayer)
  "function recordDailyMerkleRoot(uint256 _dayNumber, bytes32 _merkleRoot, uint256 _txCount) external",
  "function releaseTranche(bytes32 _umkmId, bytes32 _trancheId, uint256 _amountIdr, uint8 _trancheStage, uint8 _aiScore) external",

  // View functions (public)
  "function getMerkleRoot(uint256 _dayNumber) external view returns (bytes32)",
  "function isTrancheRecorded(bytes32 _trancheId) external view returns (bool)",
  "function getRecordedDaysCount() external view returns (uint256)",
  "function getDisbursement(uint256 _id) external view returns (tuple(bytes32 umkmId, bytes32 trancheId, uint256 amountIdr, uint8 trancheStage, uint8 aiScore, uint256 timestamp))",
  "function verifyMerkleProof(uint256 _dayNumber, bytes32[] calldata _proof, bytes32 _leaf) external view returns (bool)",
  "function disbursementCount() external view returns (uint256)",
  "function relayer() external view returns (address)",

  // Events
  "event MerkleRootRecorded(uint256 indexed dayNumber, bytes32 merkleRoot, uint256 txCount, uint256 timestamp)",
  "event TrancheReleased(uint256 indexed disbursementId, bytes32 indexed umkmId, bytes32 indexed trancheId, uint256 amountIdr, uint8 trancheStage, uint8 aiScore, uint256 timestamp)",
];

// ── MINIMUM BALANCE (Rule 7) ──────────────────────────────
const MIN_BALANCE_MATIC = ethers.parseEther("0.01"); // 0.01 MATIC minimum

// ── SINGLETON INSTANCES ───────────────────────────────────
let provider: ethers.JsonRpcProvider | null = null;
let signer: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    if (!env.POLYGON_AMOY_RPC) {
      throw new Error("[BLOCKCHAIN] POLYGON_AMOY_RPC not configured");
    }
    provider = new ethers.JsonRpcProvider(env.POLYGON_AMOY_RPC);
  }
  return provider;
}

function getSigner(): ethers.Wallet {
  if (!signer) {
    if (!env.RELAYER_PRIVATE_KEY) {
      throw new Error("[BLOCKCHAIN] RELAYER_PRIVATE_KEY not configured");
    }
    signer = new ethers.Wallet(env.RELAYER_PRIVATE_KEY, getProvider());
  }
  return signer;
}

function getContract(): ethers.Contract {
  if (!contract) {
    contract = new ethers.Contract(
      env.NEMOS_CONTRACT_ADDRESS,
      CONTRACT_ABI,
      getSigner()
    );
  }
  return contract;
}

// ══════════════════════════════════════════════════════════
// RULE 7 — BALANCE CHECK
// ══════════════════════════════════════════════════════════

/**
 * Check relayer wallet MATIC balance.
 * Rule 7: WAJIB dipanggil sebelum setiap transaksi blockchain.
 *
 * @returns { balance, sufficient, formatted }
 */
export async function checkRelayerBalance(): Promise<{
  balance: bigint;
  sufficient: boolean;
  formatted: string;
}> {
  const wallet = getSigner();
  const balance = await getProvider().getBalance(wallet.address);
  return {
    balance,
    sufficient: balance >= MIN_BALANCE_MATIC,
    formatted: ethers.formatEther(balance),
  };
}

// ══════════════════════════════════════════════════════════
// MERKLE TREE UTILITIES
// ══════════════════════════════════════════════════════════

/**
 * Hash a single transaction leaf for the Merkle tree.
 * leaf = keccak256(xenditId + amount + timestamp)
 */
export function hashTransactionLeaf(
  xenditId: string,
  amount: bigint,
  timestamp: number
): string {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "uint256", "uint256"],
      [xenditId, amount, timestamp]
    )
  );
}

/**
 * Build a Merkle tree from an array of leaf hashes.
 * Returns { root, leaves, layers }
 */
export function buildMerkleTree(leaves: string[]): {
  root: string;
  leaves: string[];
  layers: string[][];
} {
  if (leaves.length === 0) {
    return {
      root: ethers.ZeroHash,
      leaves: [],
      layers: [],
    };
  }

  // Sort leaves for deterministic ordering
  let currentLayer = [...leaves].sort();
  const layers: string[][] = [currentLayer];

  while (currentLayer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      if (i + 1 < currentLayer.length) {
        // Sort pair before hashing (must match contract's verification)
        const [a, b] =
          currentLayer[i] <= currentLayer[i + 1]
            ? [currentLayer[i], currentLayer[i + 1]]
            : [currentLayer[i + 1], currentLayer[i]];
        nextLayer.push(
          ethers.keccak256(ethers.solidityPacked(["bytes32", "bytes32"], [a, b]))
        );
      } else {
        // Odd leaf — promote to next layer
        nextLayer.push(currentLayer[i]);
      }
    }
    currentLayer = nextLayer;
    layers.push(currentLayer);
  }

  return {
    root: currentLayer[0],
    leaves: layers[0],
    layers,
  };
}

/**
 * Get Merkle proof for a specific leaf.
 */
export function getMerkleProof(
  leaf: string,
  leaves: string[]
): string[] {
  const sortedLeaves = [...leaves].sort();
  let index = sortedLeaves.indexOf(leaf);
  if (index === -1) return [];

  const proof: string[] = [];
  let currentLayer = sortedLeaves;

  while (currentLayer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      if (i + 1 < currentLayer.length) {
        const [a, b] =
          currentLayer[i] <= currentLayer[i + 1]
            ? [currentLayer[i], currentLayer[i + 1]]
            : [currentLayer[i + 1], currentLayer[i]];

        if (i === index || i + 1 === index) {
          proof.push(i === index ? currentLayer[i + 1] : currentLayer[i]);
        }

        nextLayer.push(
          ethers.keccak256(ethers.solidityPacked(["bytes32", "bytes32"], [a, b]))
        );
      } else {
        nextLayer.push(currentLayer[i]);
      }
    }
    index = Math.floor(index / 2);
    currentLayer = nextLayer;
  }

  return proof;
}

// ══════════════════════════════════════════════════════════
// WRITE FUNCTIONS (on-chain)
// ══════════════════════════════════════════════════════════

/**
 * Record daily Merkle root on-chain.
 *
 * @param dayNumber - Unix timestamp / 86400
 * @param merkleRoot - Root hash of the day's transaction tree
 * @param txCount - Number of transactions in the batch
 * @returns Transaction receipt
 */
export async function recordMerkleRoot(
  dayNumber: number,
  merkleRoot: string,
  txCount: number
): Promise<{ txHash: string; blockNumber: number }> {
  // Rule 7: Balance check
  const { sufficient, formatted } = await checkRelayerBalance();
  if (!sufficient) {
    throw new Error(
      `[BLOCKCHAIN] Insufficient relayer balance: ${formatted} MATIC. ` +
      `Minimum required: ${ethers.formatEther(MIN_BALANCE_MATIC)} MATIC`
    );
  }

  const c = getContract();

  // Idempotency check — don't send TX if already recorded
  const existingRoot = await c.getMerkleRoot(dayNumber);
  if (existingRoot !== ethers.ZeroHash) {
    console.log(`[BLOCKCHAIN] Merkle root already recorded for day ${dayNumber}`);
    return { txHash: "already-recorded", blockNumber: 0 };
  }

  console.log(`[BLOCKCHAIN] Recording Merkle root for day ${dayNumber}...`);
  console.log(`             Root: ${merkleRoot}`);
  console.log(`             TX count: ${txCount}`);

  const tx = await c.recordDailyMerkleRoot(dayNumber, merkleRoot, txCount);
  const receipt = await tx.wait();

  console.log(`[BLOCKCHAIN] ✅ Merkle root recorded!`);
  console.log(`             TX Hash: ${receipt.hash}`);
  console.log(`             Block: ${receipt.blockNumber}`);

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Record tranche disbursement on-chain.
 *
 * @param umkmDbId - Database ID of the UMKM (will be hashed)
 * @param trancheDbId - Database ID of the Tranche (will be hashed)
 * @param amountIdr - Amount in IDR
 * @param trancheStage - Stage number (1, 2, 3...)
 * @param aiScore - AI confidence score (0-100)
 */
export async function recordTranche(
  umkmDbId: string,
  trancheDbId: string,
  amountIdr: number,
  trancheStage: number,
  aiScore: number
): Promise<{ txHash: string; blockNumber: number; disbursementId?: number }> {
  // Rule 7: Balance check
  const { sufficient, formatted } = await checkRelayerBalance();
  if (!sufficient) {
    throw new Error(
      `[BLOCKCHAIN] Insufficient relayer balance: ${formatted} MATIC`
    );
  }

  const c = getContract();

  // Hash database IDs to bytes32
  const umkmId = ethers.keccak256(ethers.toUtf8Bytes(umkmDbId));
  const trancheId = ethers.keccak256(ethers.toUtf8Bytes(trancheDbId));

  // Idempotency check — skip if already recorded
  const alreadyRecorded = await c.isTrancheRecorded(trancheId);
  if (alreadyRecorded) {
    console.log(`[BLOCKCHAIN] Tranche ${trancheDbId} already recorded on-chain`);
    return { txHash: "already-recorded", blockNumber: 0 };
  }

  console.log(`[BLOCKCHAIN] Recording tranche disbursement...`);
  console.log(`             UMKM: ${umkmDbId}`);
  console.log(`             Stage: ${trancheStage}, Amount: Rp ${amountIdr.toLocaleString("id-ID")}`);

  const tx = await c.releaseTranche(umkmId, trancheId, amountIdr, trancheStage, aiScore);
  const receipt = await tx.wait();

  // Get disbursement count for the ID
  const disbursementCount = await c.disbursementCount();

  console.log(`[BLOCKCHAIN] ✅ Tranche recorded!`);
  console.log(`             TX Hash: ${receipt.hash}`);
  console.log(`             Disbursement ID: ${disbursementCount}`);

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    disbursementId: Number(disbursementCount),
  };
}

// ══════════════════════════════════════════════════════════
// VIEW FUNCTIONS (read-only)
// ══════════════════════════════════════════════════════════

/**
 * Get relayer wallet address and balance info.
 */
export async function getRelayerInfo(): Promise<{
  address: string;
  balance: string;
  sufficient: boolean;
}> {
  const wallet = getSigner();
  const { formatted, sufficient } = await checkRelayerBalance();
  return {
    address: wallet.address,
    balance: formatted,
    sufficient,
  };
}

/**
 * Verify a Merkle proof on-chain.
 */
export async function verifyProofOnChain(
  dayNumber: number,
  proof: string[],
  leaf: string
): Promise<boolean> {
  const c = getContract();
  return await c.verifyMerkleProof(dayNumber, proof, leaf);
}

/**
 * Get on-chain stats for dashboard display.
 */
export async function getOnChainStats(): Promise<{
  totalDays: number;
  totalDisbursements: number;
  contractAddress: string;
  relayerAddress: string;
}> {
  const c = getContract();
  const [totalDays, totalDisbursements, relayerAddress] = await Promise.all([
    c.getRecordedDaysCount(),
    c.disbursementCount(),
    c.relayer(),
  ]);
  return {
    totalDays: Number(totalDays),
    totalDisbursements: Number(totalDisbursements),
    contractAddress: env.NEMOS_CONTRACT_ADDRESS,
    relayerAddress,
  };
}
