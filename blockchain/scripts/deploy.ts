import { ethers, run, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy NemosEscrowLedger ke Polygon Amoy Testnet.
 *
 * Usage:
 *   Local:  npx hardhat run scripts/deploy.ts
 *   Amoy:   npx hardhat run scripts/deploy.ts --network amoy
 */
async function main() {
  // ── ENV VALIDATION (Rule 8) ─────────────────────────────
  if (network.name === "amoy") {
    const requiredVars = [
      "POLYGON_AMOY_RPC",
      "RELAYER_PRIVATE_KEY",
      "POLYGONSCAN_API_KEY",
    ];
    for (const envVar of requiredVars) {
      if (!process.env[envVar]) {
        throw new Error(
          `STARTUP FAILED: Missing required environment variable: ${envVar}`
        );
      }
    }
  }

  const [deployer] = await ethers.getSigners();

  console.log("═══════════════════════════════════════════════════");
  console.log("  NEMOS — Smart Contract Deployment");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network:  ${network.name}`);
  console.log(`  ChainId:  ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`  Deployer: ${deployer.address}`);

  // ── BALANCE CHECK (Rule 7) ──────────────────────────────
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceMatic = ethers.formatEther(balance);
  console.log(`  Balance:  ${balanceMatic} MATIC/POL`);

  if (network.name === "amoy") {
    // Minimum 0.01 MATIC untuk deploy
    const minBalance = ethers.parseEther("0.01");
    if (balance < minBalance) {
      throw new Error(
        `CRITICAL: Deployer wallet balance insufficient.\n` +
        `  Balance: ${balanceMatic} MATIC\n` +
        `  Required: >= 0.01 MATIC\n` +
        `  Action: top up wallet ${deployer.address} via Polygon Amoy faucet`
      );
    }
  }

  console.log("───────────────────────────────────────────────────");

  // ── RELAYER ADDRESS ─────────────────────────────────────
  // Pada Amoy: deployer IS the relayer (same private key).
  // Constructor menerima relayer address.
  const relayerAddress = deployer.address;
  console.log(`  Relayer:  ${relayerAddress}`);
  console.log("───────────────────────────────────────────────────");

  // ── DEPLOY ──────────────────────────────────────────────
  console.log("\n⏳ Deploying NemosEscrowLedger...");

  const Factory = await ethers.getContractFactory("NemosEscrowLedger");
  const contract = await Factory.deploy(relayerAddress);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();
  const deployTxHash = deployTx?.hash || "N/A";

  console.log(`✅ Deployed at: ${contractAddress}`);
  console.log(`   TX Hash:     ${deployTxHash}`);

  // ── WAIT FOR CONFIRMATIONS ──────────────────────────────
  if (network.name === "amoy" && deployTx) {
    console.log("\n⏳ Waiting for 5 block confirmations...");
    await deployTx.wait(5);
    console.log("✅ 5 confirmations received.");
  }

  // ── SAVE DEPLOYMENT INFO ────────────────────────────────
  const deploymentInfo = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    contractAddress: contractAddress,
    relayerAddress: relayerAddress,
    deployerAddress: deployer.address,
    transactionHash: deployTxHash,
    blockNumber: deployTx ? (await deployTx.wait())?.blockNumber : null,
    deployedAt: new Date().toISOString(),
    solidityVersion: "0.8.24",
    contractName: "NemosEscrowLedger",
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📁 Deployment info saved to: deployments/${network.name}.json`);

  // ── VERIFY ON POLYGONSCAN (Amoy only) ───────────────────
  if (network.name === "amoy") {
    console.log("\n⏳ Waiting 30s before Polygonscan verification...");
    await new Promise((resolve) => setTimeout(resolve, 30_000));

    try {
      console.log("⏳ Verifying contract on Polygonscan...");
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [relayerAddress],
      });
      console.log("✅ Contract verified on Polygonscan!");

      // Update deployment info with verified status
      deploymentInfo.verified = true;
      fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    } catch (error: any) {
      if (error.message?.includes("Already Verified") || error.message?.includes("already verified")) {
        console.log("ℹ️  Contract already verified on Polygonscan.");
        deploymentInfo.verified = true;
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
      } else {
        console.error("⚠️  Verification failed:", error.message);
        console.log("    You can verify manually:");
        console.log(
          `    npx hardhat verify --network amoy ${contractAddress} "${relayerAddress}"`
        );
        deploymentInfo.verified = false;
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
      }
    }
  }

  // ── DEPLOYMENT SUMMARY ──────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  ✅ DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Contract:  ${contractAddress}`);
  console.log(`  Relayer:   ${relayerAddress}`);
  console.log(`  Network:   ${network.name} (chainId: ${deploymentInfo.chainId})`);
  console.log(`  TX Hash:   ${deployTxHash}`);

  if (network.name === "amoy") {
    console.log(`\n  🔗 View on Polygonscan:`);
    console.log(`     https://amoy.polygonscan.com/address/${contractAddress}`);
    console.log(`\n  🔗 View TX:`);
    console.log(`     https://amoy.polygonscan.com/tx/${deployTxHash}`);
  }

  console.log("\n  📋 Env vars untuk backend (Sprint 2):");
  console.log(`     NEMOS_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`     NEMOS_RELAYER_ADDRESS=${relayerAddress}`);
  console.log("═══════════════════════════════════════════════════\n");
}

main().catch((error) => {
  console.error("❌ Deployment FAILED:", error);
  process.exitCode = 1;
});
