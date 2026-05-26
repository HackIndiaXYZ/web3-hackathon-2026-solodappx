// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SkillChain
 * @notice Decentralized skill credentials on Polygon blockchain
 * @dev Each credential is immutably stored as a bytes32 key mapped to a Credential struct.
 *      Issuers can revoke credentials they issued. Verification is fully trustless and public.
 */
contract SkillChain {
    // ── Structs ───────────────────────────────────────────────
    struct Credential {
        address recipient;       // Wallet that owns this credential
        address issuer;          // Wallet that issued this credential
        string  metadataHash;    // SHA-256 or IPFS hash of credential metadata
        string  skillName;       // Human-readable skill name
        uint8   level;           // Proficiency level: 1=Beginner, 5=Master
        uint256 issuedAt;        // Unix timestamp of issuance
        bool    revoked;         // Whether the issuer has revoked this credential
        uint256 revokedAt;       // Revocation timestamp (0 if not revoked)
    }

    // ── State variables ───────────────────────────────────────
    address public owner;
    uint256 public totalCredentials;

    mapping(bytes32 => Credential) public credentials;
    mapping(address => bytes32[]) private credentialsByRecipient;
    mapping(address => bytes32[]) private credentialsByIssuer;
    mapping(address => bool) public authorizedIssuers;

    // ── Events ────────────────────────────────────────────────
    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed recipient,
        address indexed issuer,
        string metadataHash,
        string skillName,
        uint8 level,
        uint256 timestamp
    );

    event CredentialRevoked(
        bytes32 indexed credentialId,
        address indexed issuer,
        uint256 timestamp
    );

    event CredentialVerified(
        bytes32 indexed credentialId,
        address indexed verifier,
        uint256 timestamp
    );

    event IssuerAuthorized(address indexed issuer, uint256 timestamp);
    event IssuerRevoked(address indexed issuer, uint256 timestamp);

    // ── Modifiers ─────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "SkillChain: caller is not owner");
        _;
    }

    modifier credentialExists(bytes32 credentialId) {
        require(credentials[credentialId].issuedAt != 0, "SkillChain: credential does not exist");
        _;
    }

    // ── Constructor ───────────────────────────────────────────
    constructor() {
        owner = msg.sender;
        // Owner is automatically an authorized issuer
        authorizedIssuers[msg.sender] = true;
        emit IssuerAuthorized(msg.sender, block.timestamp);
    }

    // ── Core functions ────────────────────────────────────────

    /**
     * @notice Issue a new credential to a recipient
     * @param recipient  Wallet address of the credential recipient
     * @param metadataHash SHA-256 or IPFS hash of credential metadata JSON
     * @param skillName  Name of the skill being certified
     * @param level      Proficiency level (1-5)
     * @return credentialId Unique bytes32 identifier for this credential
     */
    function issueCredential(
        address recipient,
        string memory metadataHash,
        string memory skillName,
        uint8 level
    ) external returns (bytes32 credentialId) {
        require(recipient != address(0), "SkillChain: invalid recipient");
        require(bytes(skillName).length > 0, "SkillChain: skill name required");
        require(level >= 1 && level <= 5, "SkillChain: level must be 1-5");

        // Generate unique credentialId
        credentialId = keccak256(abi.encodePacked(
            recipient,
            msg.sender,
            skillName,
            metadataHash,
            block.timestamp,
            totalCredentials
        ));

        // Ensure no collision (extremely unlikely but safe)
        require(credentials[credentialId].issuedAt == 0, "SkillChain: credential ID collision");

        // Store credential
        credentials[credentialId] = Credential({
            recipient: recipient,
            issuer: msg.sender,
            metadataHash: metadataHash,
            skillName: skillName,
            level: level,
            issuedAt: block.timestamp,
            revoked: false,
            revokedAt: 0
        });

        // Update indexes
        credentialsByRecipient[recipient].push(credentialId);
        credentialsByIssuer[msg.sender].push(credentialId);
        totalCredentials++;

        emit CredentialIssued(
            credentialId,
            recipient,
            msg.sender,
            metadataHash,
            skillName,
            level,
            block.timestamp
        );
    }

    /**
     * @notice Revoke a credential (only the original issuer can revoke)
     * @param credentialId The credential to revoke
     */
    function revokeCredential(bytes32 credentialId)
        external
        credentialExists(credentialId)
    {
        Credential storage cred = credentials[credentialId];
        require(cred.issuer == msg.sender, "SkillChain: only issuer can revoke");
        require(!cred.revoked, "SkillChain: already revoked");

        cred.revoked = true;
        cred.revokedAt = block.timestamp;

        emit CredentialRevoked(credentialId, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify a credential's validity
     * @param credentialId The credential ID to verify
     * @return isValid     True if credential exists and is not revoked
     * @return recipient   Wallet of the credential holder
     * @return issuer      Wallet of the credential issuer
     * @return metadataHash Hash of credential metadata
     * @return issuedAt    Timestamp of issuance
     * @return revoked     Whether credential has been revoked
     */
    function verifyCredential(bytes32 credentialId)
        external
        returns (
            bool isValid,
            address recipient,
            address issuer,
            string memory metadataHash,
            uint256 issuedAt,
            bool revoked
        )
    {
        Credential memory cred = credentials[credentialId];

        // Credential doesn't exist if issuedAt == 0
        isValid = cred.issuedAt != 0 && !cred.revoked;
        recipient = cred.recipient;
        issuer = cred.issuer;
        metadataHash = cred.metadataHash;
        issuedAt = cred.issuedAt;
        revoked = cred.revoked;

        if (cred.issuedAt != 0) {
            emit CredentialVerified(credentialId, msg.sender, block.timestamp);
        }
    }

    // ── View functions ────────────────────────────────────────

    /**
     * @notice Get all credential IDs for a recipient
     */
    function getCredentialsByRecipient(address recipient)
        external view returns (bytes32[] memory)
    {
        return credentialsByRecipient[recipient];
    }

    /**
     * @notice Get all credential IDs issued by an address
     */
    function getCredentialsByIssuer(address issuer)
        external view returns (bytes32[] memory)
    {
        return credentialsByIssuer[issuer];
    }

    /**
     * @notice Check if a specific credential is valid (view-only, no gas for reading)
     */
    function isCredentialValid(bytes32 credentialId) external view returns (bool) {
        Credential memory cred = credentials[credentialId];
        return cred.issuedAt != 0 && !cred.revoked;
    }

    // ── Admin functions ───────────────────────────────────────

    function authorizeIssuer(address issuer) external onlyOwner {
        require(!authorizedIssuers[issuer], "SkillChain: already authorized");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, block.timestamp);
    }

    function revokeIssuer(address issuer) external onlyOwner {
        require(issuer != owner, "SkillChain: cannot revoke owner");
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, block.timestamp);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SkillChain: invalid new owner");
        owner = newOwner;
        authorizedIssuers[newOwner] = true;
    }
}
