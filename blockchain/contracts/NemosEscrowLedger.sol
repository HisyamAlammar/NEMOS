// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NemosEscrowLedger
 * @author NEMOS Team — Bank Indonesia Hackathon 2026
 * @notice Immutable audit trail untuk platform impact investing NEMOS.
 *
 * PENTING — Contract ini BUKAN escrow dalam arti memegang uang kripto.
 * Semua uang nyata (Rupiah) dikelola oleh Xendit Payment Gateway.
 * Contract ini hanya berfungsi sebagai:
 *   1. Penyimpan Merkle Root harian dari batch transaksi fiat
 *   2. Pencatat disbursement tranche yang sudah diverifikasi AI
 *   3. Sumber kebenaran on-chain yang dapat diaudit publik
 *
 * Hanya relayer wallet milik backend NEMOS yang bisa menulis ke contract ini.
 * User akhir TIDAK berinteraksi langsung dengan contract (wallet-less UX).
 */
contract NemosEscrowLedger is Ownable, Pausable, ReentrancyGuard {

    // ══════════════════════════════════════════════════════════════
    // STATE
    // ══════════════════════════════════════════════════════════════

    /// @notice Address wallet relayer backend NEMOS — satu-satunya yang bisa menulis
    address public relayer;

    /// @notice Mapping dari day number (timestamp / 86400) ke Merkle Root
    mapping(uint256 => bytes32) public dailyMerkleRoots;

    /// @notice Array of all day numbers yang sudah tercatat (untuk enumeration)
    uint256[] public recordedDays;

    /// @notice Counter auto-increment untuk disbursement ID
    uint256 public disbursementCount;

    /// @notice Data pencairan tranche yang tercatat on-chain
    struct Disbursement {
        bytes32 umkmId;       // keccak256(umkm database ID)
        bytes32 trancheId;    // keccak256(tranche database ID)
        uint256 amountIdr;    // Jumlah dalam Rupiah (bukan wei/crypto)
        uint8   trancheStage; // Tahap pencairan: 1, 2, 3...
        uint8   aiScore;      // Confidence score dari AI OCR (0-100)
        uint256 timestamp;    // block.timestamp saat dicatat
    }

    /// @notice Mapping dari disbursement ID ke data disbursement
    mapping(uint256 => Disbursement) public disbursements;

    /// @notice Mapping dari trancheId ke disbursement ID (mencegah duplikasi)
    mapping(bytes32 => uint256) public trancheToDisbursement;

    // ══════════════════════════════════════════════════════════════
    // EVENTS
    // ══════════════════════════════════════════════════════════════

    event MerkleRootRecorded(
        uint256 indexed dayNumber,
        bytes32 merkleRoot,
        uint256 txCount,
        uint256 timestamp
    );

    event TrancheReleased(
        uint256 indexed disbursementId,
        bytes32 indexed umkmId,
        bytes32 indexed trancheId,
        uint256 amountIdr,
        uint8   trancheStage,
        uint8   aiScore,
        uint256 timestamp
    );

    event RelayerUpdated(
        address indexed oldRelayer,
        address indexed newRelayer
    );

    // ══════════════════════════════════════════════════════════════
    // ERRORS
    // ══════════════════════════════════════════════════════════════

    error OnlyRelayer();
    error ZeroAddress();
    error MerkleRootAlreadyRecorded(uint256 dayNumber);
    error InvalidMerkleRoot();
    error TrancheAlreadyRecorded(bytes32 trancheId);
    error InvalidAiScore(uint8 score);
    error InvalidAmountIdr();
    error InvalidTrancheStage();

    // ══════════════════════════════════════════════════════════════
    // MODIFIERS
    // ══════════════════════════════════════════════════════════════

    /// @notice Hanya relayer wallet yang bisa memanggil fungsi ini
    modifier onlyRelayer() {
        if (msg.sender != relayer) revert OnlyRelayer();
        _;
    }

    // ══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════

    /**
     * @param _relayer Address wallet relayer backend NEMOS
     * @dev Owner = deployer (untuk updateRelayer dan pause/unpause)
     *      Relayer = backend wallet (untuk recordMerkleRoot dan releaseTranche)
     */
    constructor(address _relayer) Ownable(msg.sender) {
        if (_relayer == address(0)) revert ZeroAddress();
        relayer = _relayer;
        emit RelayerUpdated(address(0), _relayer);
    }

    // ══════════════════════════════════════════════════════════════
    // WRITE FUNCTIONS (onlyRelayer)
    // ══════════════════════════════════════════════════════════════

    /**
     * @notice Catat Merkle Root dari batch transaksi harian.
     *         Dipanggil oleh cron job relayer setiap hari pukul 23:59.
     *
     * @param _dayNumber  Nomor hari (block.timestamp / 86400 di backend)
     * @param _merkleRoot Merkle root dari kumpulan transaksi Xendit hari itu
     * @param _txCount    Jumlah transaksi dalam batch (untuk informasi)
     *
     * @dev Idempotent — revert jika dayNumber sudah tercatat.
     *      Ini memastikan satu hari hanya punya satu root.
     */
    function recordDailyMerkleRoot(
        uint256 _dayNumber,
        bytes32 _merkleRoot,
        uint256 _txCount
    )
        external
        onlyRelayer
        whenNotPaused
        nonReentrant
    {
        // Validasi input
        if (_merkleRoot == bytes32(0)) revert InvalidMerkleRoot();

        // Idempotency check — tidak boleh overwrite root yang sudah ada
        if (dailyMerkleRoots[_dayNumber] != bytes32(0)) {
            revert MerkleRootAlreadyRecorded(_dayNumber);
        }

        // Simpan
        dailyMerkleRoots[_dayNumber] = _merkleRoot;
        recordedDays.push(_dayNumber);

        emit MerkleRootRecorded(_dayNumber, _merkleRoot, _txCount, block.timestamp);
    }

    /**
     * @notice Catat pencairan tranche ke UMKM.
     *         Dipanggil setelah AI OCR memverifikasi struk belanja.
     *
     * @param _umkmId       keccak256 hash dari UMKM database ID
     * @param _trancheId    keccak256 hash dari Tranche database ID
     * @param _amountIdr    Jumlah dalam Rupiah
     * @param _trancheStage Tahap pencairan (1, 2, 3...)
     * @param _aiScore      Confidence score AI OCR (0-100)
     *
     * @dev Idempotent — revert jika trancheId sudah tercatat.
     */
    function releaseTranche(
        bytes32 _umkmId,
        bytes32 _trancheId,
        uint256 _amountIdr,
        uint8   _trancheStage,
        uint8   _aiScore
    )
        external
        onlyRelayer
        whenNotPaused
        nonReentrant
    {
        // Validasi input
        if (_amountIdr == 0) revert InvalidAmountIdr();
        if (_trancheStage == 0) revert InvalidTrancheStage();
        if (_aiScore > 100) revert InvalidAiScore(_aiScore);

        // Idempotency check — satu tranche hanya boleh dicatat sekali
        if (trancheToDisbursement[_trancheId] != 0) {
            revert TrancheAlreadyRecorded(_trancheId);
        }

        // Auto-increment ID (mulai dari 1, bukan 0)
        disbursementCount++;
        uint256 newId = disbursementCount;

        // Simpan disbursement
        disbursements[newId] = Disbursement({
            umkmId: _umkmId,
            trancheId: _trancheId,
            amountIdr: _amountIdr,
            trancheStage: _trancheStage,
            aiScore: _aiScore,
            timestamp: block.timestamp
        });

        // Link trancheId ke disbursement ID
        trancheToDisbursement[_trancheId] = newId;

        emit TrancheReleased(
            newId,
            _umkmId,
            _trancheId,
            _amountIdr,
            _trancheStage,
            _aiScore,
            block.timestamp
        );
    }

    // ══════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS (onlyOwner)
    // ══════════════════════════════════════════════════════════════

    /**
     * @notice Ganti address relayer wallet.
     *         Hanya dipanggil jika relayer wallet compromised atau di-rotate.
     */
    function updateRelayer(address _newRelayer) external onlyOwner {
        if (_newRelayer == address(0)) revert ZeroAddress();
        address oldRelayer = relayer;
        relayer = _newRelayer;
        emit RelayerUpdated(oldRelayer, _newRelayer);
    }

    /// @notice Emergency pause — hentikan semua write operations
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resume setelah emergency resolve
    function unpause() external onlyOwner {
        _unpause();
    }

    // ══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS (public — siapapun bisa memverifikasi)
    // ══════════════════════════════════════════════════════════════

    /**
     * @notice Verifikasi apakah sebuah leaf (hash transaksi) ada dalam
     *         Merkle Tree hari tertentu.
     *
     * @param _dayNumber Nomor hari
     * @param _proof     Array of sibling hashes (Merkle proof)
     * @param _leaf      Hash dari transaksi yang ingin diverifikasi
     *
     * @return isValid true jika leaf valid terhadap root hari itu
     */
    function verifyMerkleProof(
        uint256 _dayNumber,
        bytes32[] calldata _proof,
        bytes32 _leaf
    )
        external
        view
        returns (bool isValid)
    {
        bytes32 root = dailyMerkleRoots[_dayNumber];
        if (root == bytes32(0)) return false;

        // Recompute root dari leaf + proof
        bytes32 computedHash = _leaf;
        for (uint256 i = 0; i < _proof.length; i++) {
            bytes32 proofElement = _proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }

    /**
     * @notice Ambil data disbursement berdasarkan ID
     */
    function getDisbursement(uint256 _id)
        external
        view
        returns (Disbursement memory)
    {
        return disbursements[_id];
    }

    /**
     * @notice Ambil Merkle Root untuk hari tertentu
     */
    function getMerkleRoot(uint256 _dayNumber)
        external
        view
        returns (bytes32)
    {
        return dailyMerkleRoots[_dayNumber];
    }

    /**
     * @notice Ambil total jumlah hari yang sudah tercatat
     */
    function getRecordedDaysCount() external view returns (uint256) {
        return recordedDays.length;
    }

    /**
     * @notice Cek apakah sebuah tranche sudah pernah dicatat
     */
    function isTrancheRecorded(bytes32 _trancheId) external view returns (bool) {
        return trancheToDisbursement[_trancheId] != 0;
    }

    // ══════════════════════════════════════════════════════════════
    // RECEIVE / FALLBACK — DITOLAK
    // ══════════════════════════════════════════════════════════════

    /**
     * @dev Contract ini TIDAK menerima ETH/MATIC.
     *      Jika ada yang tidak sengaja kirim, transaksi di-revert.
     */
    receive() external payable {
        revert("NemosEscrowLedger: does not accept ETH/MATIC");
    }

    fallback() external payable {
        revert("NemosEscrowLedger: does not accept ETH/MATIC");
    }
}
