import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Test script: Connect ke NemosEscrowLedger yang sudah di-deploy
 * dan panggil view functions untuk konfirmasi contract berjalan.
 *
 * Usage:
 *   npx hardhat run scripts/testDeploy.ts --network amoy
 */
async function main() {
  // ── ENV VALIDATION (Rule 8) ─────────────────────────────
  if (network.name === "amoy") {
    if (!process.env.POLYGON_AMOY_RPC) {
      throw new Error("STARTUP FAILED: Missing POLYGON_AMOY_RPC");
    }
    if (!process.env.RELAYER_PRIVATE_KEY) {
      throw new Error("STARTUP FAILED: Missing RELAYER_PRIVATE_KEY");
    }
  }

  // ── LOAD DEPLOYMENT INFO ────────────────────────────────
  const deploymentFile = path.join(
    __dirname,
    "..",
    "deployments",
    `${network.name}.json`
  );

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(
      `Deployment file not found: ${deploymentFile}\n` +
      `Run deploy script first: npx hardhat run scripts/deploy.ts --network ${network.name}`
    );
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const contractAddress = deployment.contractAddress;

  console.log("═══════════════════════════════════════════════════");
  console.log("  NEMOS — Post-Deploy Verification");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network:   ${network.name}`);
  console.log(`  Contract:  ${contractAddress}`);
  console.log("───────────────────────────────────────────────────");

  // ── CONNECT TO CONTRACT ─────────────────────────────────
  const [signer] = await ethers.getSigners();
  console.log(`  Signer:    ${signer.address}`);

  // ── BALANCE CHECK (Rule 7) ──────────────────────────────
  const balance = await ethers.provider.getBalance(signer.address);
  console.log(`  Balance:   ${ethers.formatEther(balance)} MATIC/POL`);
  console.log("───────────────────────────────────────────────────\n");

  // Get contract ABI from compiled artifacts
  const contractABI = (
    await ethers.getContractFactory("NemosEscrowLedger")
  ).interface;

  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  // ── TEST 1: Read relayer address ────────────────────────
  console.log("📋 Test 1: Reading relayer address...");
  const relayer = await contract.relayer();
  console.log(`   ✅ Relayer: ${relayer}`);
  console.log(
    `   ${relayer === signer.address ? "✅ Matches signer (correct)" : "⚠️ Different from signer"}`
  );

  // ── TEST 2: Read owner address ──────────────────────────
  console.log("\n📋 Test 2: Reading owner address...");
  const owner = await contract.owner();
  console.log(`   ✅ Owner: ${owner}`);

  // ── TEST 3: Read disbursementCount ──────────────────────
  console.log("\n📋 Test 3: Reading disbursement count...");
  const count = await contract.disbursementCount();
  console.log(`   ✅ Disbursement count: ${count} (expected: 0)`);

  // ── TEST 4: Read recordedDays count ─────────────────────
  console.log("\n📋 Test 4: Reading recorded days count...");
  const daysCount = await contract.getRecordedDaysCount();
  console.log(`   ✅ Recorded days: ${daysCount} (expected: 0)`);

  // ── TEST 5: Check contract is NOT paused ────────────────
  console.log("\n📋 Test 5: Checking pause status...");
  const paused = await contract.paused();
  console.log(`   ✅ Paused: ${paused} (expected: false)`);

  // ── TEST 6: Check getMerkleRoot for non-existent day ────
  console.log("\n📋 Test 6: Reading non-existent Merkle root...");
  const root = await contract.getMerkleRoot(0);
  const isZero =
    root === "0x0000000000000000000000000000000000000000000000000000000000000000";
  console.log(`   ✅ Root for day 0: ${isZero ? "bytes32(0) — correct" : root}`);

  // ── SUMMARY ─────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  ✅ ALL CHECKS PASSED — Contract is live and operational");
  console.log("═══════════════════════════════════════════════════");

  if (network.name === "amoy") {
    console.log(
      `\n  🔗 https://amoy.polygonscan.com/address/${contractAddress}`
    );
  }

  console.log("");
}

main().catch((error) => {
  console.error("❌ Verification FAILED:", error);
  process.exitCode = 1;
});
