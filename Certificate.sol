// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Certificate {
    mapping(bytes32 => bool) public certificates;
    address public owner;

    event CertificateIssued(bytes32 indexed hash);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can issue certificates");
        _;
    }

    function issueCertificate(bytes32 _hash) public onlyOwner {
        require(!certificates[_hash], "Certificate already exists");
        certificates[_hash] = true;
        emit CertificateIssued(_hash);
    }

    function verifyCertificate(bytes32 _hash) public view returns (bool) {
        return certificates[_hash];
    }
}
