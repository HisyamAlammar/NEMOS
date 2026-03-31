import { expect } from "chai";
import { ethers } from "hardhat";
import { NemosEscrowLedger } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes, solidityPacked, AbiCoder } from "ethers";

describe("NemosEscrowLedger", function () {
  let contract: NemosEscrowLedger;
  let owner: SignerWithAddress;
  let relayer: SignerWithAddress;
  let stranger: SignerWithAddress;

  // Helper: hash string ID menjadi bytes32
  const toBytes32 = (str: string): string => keccak256(toUtf8Bytes(str));

  // Helper: buat Merkle root sederhana dari array of leaves
  const buildSimpleMerkleRoot = (leaves: string[]): string => {
    if (leaves.length === 0) return ethers.ZeroHash;
    if (leaves.length === 1) return leaves[0];

    const sorted = [...leaves].sort();
    let layer = sorted;
    while (layer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < layer.length; i += 2) {
        if (i + 1 < layer.length) {
          const [a, b] = layer[i] <= layer[i + 1]
            ? [layer[i], layer[i + 1]]
            : [layer[i + 1], layer[i]];
          nextLayer.push(
            keccak256(solidityPacked(["bytes32", "bytes32"], [a, b]))
          );
        } else {
          nextLayer.push(layer[i]);
        }
      }
      layer = nextLayer;
    }
    return layer[0];
  };

  beforeEach(async function () {
    [owner, relayer, stranger] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("NemosEscrowLedger");
    contract = await Factory.deploy(relayer.address);
    await contract.waitForDeployment();
  });

  // ──────────────────────────────────────────────────────────
  // DEPLOYMENT
  // ──────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("harus set owner ke deployer", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("harus set relayer ke address yang diberikan", async function () {
      expect(await contract.relayer()).to.equal(relayer.address);
    });

    it("harus revert jika relayer address = zero", async function () {
      const Factory = await ethers.getContractFactory("NemosEscrowLedger");
      await expect(
        Factory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "ZeroAddress");
    });

    it("harus emit RelayerUpdated event", async function () {
      const Factory = await ethers.getContractFactory("NemosEscrowLedger");
      const tx = await Factory.deploy(relayer.address);
      await expect(tx.deploymentTransaction())
        .to.emit(tx, "RelayerUpdated")
        .withArgs(ethers.ZeroAddress, relayer.address);
    });

    it("disbursementCount harus mulai dari 0", async function () {
      expect(await contract.disbursementCount()).to.equal(0);
    });
  });

  // ──────────────────────────────────────────────────────────
  // MERKLE ROOT RECORDING
  // ──────────────────────────────────────────────────────────

  describe("recordDailyMerkleRoot", function () {
    const dayNumber = 20000; // arbitrary day
    const merkleRoot = toBytes32("test-merkle-root-day-20000");
    const txCount = 42;

    it("relayer bisa catat merkle root", async function () {
      await expect(
        contract.connect(relayer).recordDailyMerkleRoot(dayNumber, merkleRoot, txCount)
      )
        .to.emit(contract, "MerkleRootRecorded")
        .withArgs(dayNumber, merkleRoot, txCount, await getBlockTimestamp());

      expect(await contract.getMerkleRoot(dayNumber)).to.equal(merkleRoot);
      expect(await contract.getRecordedDaysCount()).to.equal(1);
    });

    it("stranger TIDAK bisa catat merkle root", async function () {
      await expect(
        contract.connect(stranger).recordDailyMerkleRoot(dayNumber, merkleRoot, txCount)
      ).to.be.revertedWithCustomError(contract, "OnlyRelayer");
    });

    it("owner TIDAK bisa catat merkle root (bukan relayer)", async function () {
      await expect(
        contract.connect(owner).recordDailyMerkleRoot(dayNumber, merkleRoot, txCount)
      ).to.be.revertedWithCustomError(contract, "OnlyRelayer");
    });

    it("revert jika merkle root = bytes32(0)", async function () {
      await expect(
        contract.connect(relayer).recordDailyMerkleRoot(dayNumber, ethers.ZeroHash, txCount)
      ).to.be.revertedWithCustomError(contract, "InvalidMerkleRoot");
    });

    it("IDEMPOTENT — revert jika hari sudah tercatat (no overwrite)", async function () {
      await contract.connect(relayer).recordDailyMerkleRoot(dayNumber, merkleRoot, txCount);

      const differentRoot = toBytes32("different-root");
      await expect(
        contract.connect(relayer).recordDailyMerkleRoot(dayNumber, differentRoot, 10)
      ).to.be.revertedWithCustomError(contract, "MerkleRootAlreadyRecorded");
    });

    it("bisa catat root untuk hari berbeda", async function () {
      const root1 = toBytes32("root-day-1");
      const root2 = toBytes32("root-day-2");

      await contract.connect(relayer).recordDailyMerkleRoot(20001, root1, 10);
      await contract.connect(relayer).recordDailyMerkleRoot(20002, root2, 20);

      expect(await contract.getMerkleRoot(20001)).to.equal(root1);
      expect(await contract.getMerkleRoot(20002)).to.equal(root2);
      expect(await contract.getRecordedDaysCount()).to.equal(2);
    });

    it("revert saat contract di-pause", async function () {
      await contract.connect(owner).pause();

      await expect(
        contract.connect(relayer).recordDailyMerkleRoot(dayNumber, merkleRoot, txCount)
      ).to.be.revertedWithCustomError(contract, "EnforcedPause");
    });
  });

  // ──────────────────────────────────────────────────────────
  // TRANCHE RELEASE
  // ──────────────────────────────────────────────────────────

  describe("releaseTranche", function () {
    const umkmId = toBytes32("umkm-kedai-kopi-senja");
    const trancheId = toBytes32("tranche-001");
    const amountIdr = 20_000_000; // Rp 20.000.000
    const trancheStage = 1;
    const aiScore = 92;

    it("relayer bisa catat pencairan tranche", async function () {
      await expect(
        contract.connect(relayer).releaseTranche(
          umkmId, trancheId, amountIdr, trancheStage, aiScore
        )
      ).to.emit(contract, "TrancheReleased");

      expect(await contract.disbursementCount()).to.equal(1);

      const d = await contract.getDisbursement(1);
      expect(d.umkmId).to.equal(umkmId);
      expect(d.trancheId).to.equal(trancheId);
      expect(d.amountIdr).to.equal(amountIdr);
      expect(d.trancheStage).to.equal(trancheStage);
      expect(d.aiScore).to.equal(aiScore);
    });

    it("stranger TIDAK bisa catat tranche", async function () {
      await expect(
        contract.connect(stranger).releaseTranche(
          umkmId, trancheId, amountIdr, trancheStage, aiScore
        )
      ).to.be.revertedWithCustomError(contract, "OnlyRelayer");
    });

    it("IDEMPOTENT — revert jika trancheId sudah tercatat", async function () {
      await contract.connect(relayer).releaseTranche(
        umkmId, trancheId, amountIdr, trancheStage, aiScore
      );

      await expect(
        contract.connect(relayer).releaseTranche(
          umkmId, trancheId, amountIdr, 2, 95
        )
      ).to.be.revertedWithCustomError(contract, "TrancheAlreadyRecorded");
    });

    it("revert jika amountIdr = 0", async function () {
      await expect(
        contract.connect(relayer).releaseTranche(
          umkmId, trancheId, 0, trancheStage, aiScore
        )
      ).to.be.revertedWithCustomError(contract, "InvalidAmountIdr");
    });

    it("revert jika trancheStage = 0", async function () {
      await expect(
        contract.connect(relayer).releaseTranche(
          umkmId, trancheId, amountIdr, 0, aiScore
        )
      ).to.be.revertedWithCustomError(contract, "InvalidTrancheStage");
    });

    it("revert jika aiScore > 100", async function () {
      await expect(
        contract.connect(relayer).releaseTranche(
          umkmId, trancheId, amountIdr, trancheStage, 101
        )
      ).to.be.revertedWithCustomError(contract, "InvalidAiScore");
    });

    it("bisa catat multiple tranches (auto-increment ID)", async function () {
      const tid1 = toBytes32("tranche-A");
      const tid2 = toBytes32("tranche-B");

      await contract.connect(relayer).releaseTranche(umkmId, tid1, 10_000_000, 1, 90);
      await contract.connect(relayer).releaseTranche(umkmId, tid2, 15_000_000, 2, 88);

      expect(await contract.disbursementCount()).to.equal(2);

      const d1 = await contract.getDisbursement(1);
      expect(d1.amountIdr).to.equal(10_000_000);

      const d2 = await contract.getDisbursement(2);
      expect(d2.amountIdr).to.equal(15_000_000);
      expect(d2.trancheStage).to.equal(2);
    });

    it("isTrancheRecorded returns true setelah dicatat", async function () {
      expect(await contract.isTrancheRecorded(trancheId)).to.equal(false);

      await contract.connect(relayer).releaseTranche(
        umkmId, trancheId, amountIdr, trancheStage, aiScore
      );

      expect(await contract.isTrancheRecorded(trancheId)).to.equal(true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // MERKLE PROOF VERIFICATION
  // ──────────────────────────────────────────────────────────

  describe("verifyMerkleProof", function () {
    it("return false jika hari belum tercatat", async function () {
      const fakeProof = [toBytes32("a")];
      const fakeLeaf = toBytes32("b");

      expect(
        await contract.verifyMerkleProof(99999, fakeProof, fakeLeaf)
      ).to.equal(false);
    });

    it("return true untuk proof yang valid", async function () {
      // Build a simple 2-leaf Merkle tree
      const leaf1 = toBytes32("tx-001");
      const leaf2 = toBytes32("tx-002");

      const root = buildSimpleMerkleRoot([leaf1, leaf2]);
      const dayNumber = 20100;

      await contract.connect(relayer).recordDailyMerkleRoot(dayNumber, root, 2);

      // Proof for leaf1 = [leaf2] (sibling)
      const isValid = await contract.verifyMerkleProof(dayNumber, [leaf2], leaf1);
      expect(isValid).to.equal(true);
    });

    it("return false untuk proof yang invalid", async function () {
      const leaf1 = toBytes32("tx-001");
      const leaf2 = toBytes32("tx-002");

      const root = buildSimpleMerkleRoot([leaf1, leaf2]);
      const dayNumber = 20101;

      await contract.connect(relayer).recordDailyMerkleRoot(dayNumber, root, 2);

      // Wrong proof
      const fakeProof = [toBytes32("wrong-sibling")];
      const isValid = await contract.verifyMerkleProof(dayNumber, fakeProof, leaf1);
      expect(isValid).to.equal(false);
    });
  });

  // ──────────────────────────────────────────────────────────
  // ADMIN FUNCTIONS
  // ──────────────────────────────────────────────────────────

  describe("Admin Functions", function () {
    it("owner bisa update relayer", async function () {
      await expect(
        contract.connect(owner).updateRelayer(stranger.address)
      )
        .to.emit(contract, "RelayerUpdated")
        .withArgs(relayer.address, stranger.address);

      expect(await contract.relayer()).to.equal(stranger.address);
    });

    it("non-owner TIDAK bisa update relayer", async function () {
      await expect(
        contract.connect(stranger).updateRelayer(stranger.address)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("revert jika new relayer = zero address", async function () {
      await expect(
        contract.connect(owner).updateRelayer(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "ZeroAddress");
    });

    it("owner bisa pause dan unpause", async function () {
      await contract.connect(owner).pause();
      expect(await contract.paused()).to.equal(true);

      await contract.connect(owner).unpause();
      expect(await contract.paused()).to.equal(false);
    });

    it("non-owner TIDAK bisa pause", async function () {
      await expect(
        contract.connect(stranger).pause()
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });

  // ──────────────────────────────────────────────────────────
  // ETH/MATIC REJECTION
  // ──────────────────────────────────────────────────────────

  describe("ETH/MATIC Rejection", function () {
    it("revert jika ada yang mengirim ETH ke contract", async function () {
      await expect(
        owner.sendTransaction({
          to: await contract.getAddress(),
          value: ethers.parseEther("0.1"),
        })
      ).to.be.reverted;
    });
  });

  // ──────────────────────────────────────────────────────────
  // HELPER
  // ──────────────────────────────────────────────────────────

  async function getBlockTimestamp(): Promise<number> {
    const block = await ethers.provider.getBlock("latest");
    // Return approximate — timestamp might shift by 1 in next block
    return block ? block.timestamp + 1 : 0;
  }
});
