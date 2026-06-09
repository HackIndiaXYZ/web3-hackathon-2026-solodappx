// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SkillsChain
 * @notice Decentralized skill credential issuance and verification on Polygon
 * @dev Deploy on Polygon Mumbai using Remix IDE: https://remix.ethereum.org
 *      Paste this code, compile with 0.8.20, deploy on Injected Web3 (MetaMask)
 *      Copy the deployed address into frontend/src/contract/config.js
 */
contract SkillsChain {
    struct Credential {
        string name;
        string skill;
        address issuer;
        uint256 timestamp;
        uint256 id;
        bool exists;
    }

    uint256 private _counter;
    mapping(address => Credential[]) private _creds;
    mapping(uint256 => Credential) private _byId;
    uint256[] private _allIds;

    event CredentialIssued(uint256 indexed id, address indexed student, string name, string skill, address issuer, uint256 ts);
    event CredentialVerified(uint256 indexed id, address indexed verifier, uint256 ts);

    error InvalidAddress();
    error EmptyString();
    error CredentialNotFound();

    function issueCredential(address student, string calldata name, string calldata skill) external returns (uint256) {
        if (student == address(0)) revert InvalidAddress();
        if (bytes(name).length == 0 || bytes(skill).length == 0) revert EmptyString();
        uint256 id = ++_counter;
        Credential memory c = Credential(name, skill, msg.sender, block.timestamp, id, true);
        _creds[student].push(c);
        _byId[id] = c;
        _allIds.push(id);
        emit CredentialIssued(id, student, name, skill, msg.sender, block.timestamp);
        return id;
    }

    function getCredentials(address student) external view returns (Credential[] memory) { return _creds[student]; }
    function getCredentialById(uint256 id) external view returns (Credential memory) {
        if (!_byId[id].exists) revert CredentialNotFound();
        return _byId[id];
    }
    function verifyCredential(uint256 id) external returns (Credential memory) {
        if (!_byId[id].exists) revert CredentialNotFound();
        emit CredentialVerified(id, msg.sender, block.timestamp);
        return _byId[id];
    }
    function getTotalCredentials() external view returns (uint256) { return _counter; }
    function getAllCredentialIds() external view returns (uint256[] memory) { return _allIds; }
}
