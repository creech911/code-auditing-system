// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuditContract is Ownable {
    uint256 public submissionFee;
    uint256 public maxAuditsPerSubmission = 5; // Maximum audits a single submission can receive.
    
    struct Audit {
        address auditor;
        string report;
    }
    mapping(address => bool) public isAuditor; // Tracks if an address is a registered auditor.
    mapping(uint256 => Audit[]) public submissionAudits; // Maps submission IDs to their audits.
    uint256 public nextSubmissionId = 0;

    event AuditPerformed(uint256 submissionId, address auditor, string auditReport);
    event AuditorRegistered(address auditor);
    event AuditorRewarded(address auditor, uint256 rewardAmount);

    constructor(uint256 _submissionFee) {
        submissionFee = _submissionFee;
    }

    function registerAuditor(address auditor) public onlyOwner {
        isAuditor[auditor] = true;
        emit AuditorRegistered(auditor);
    }

    function performAudit(uint256 submissionId, string calldata auditReport) public payable {
        require(isAuditor[msg.sender], "Only registered auditors can perform audits");
        require(msg.value == submissionFee, "Incorrect submission fee");
        require(submissionAudits[submissionId].length < maxAuditsPerSubmission, "This submission has reached its maximum number of audits");

        // Refund any excess payment
        if (msg.value > submissionFee) {
            payable(msg.sender).transfer(msg.value - submissionFee);
        }
        
        submissionAudits[submissionId].push(Audit(msg.sender, auditReport));
        emit AuditPerformed(submissionId, msg.sender, auditReport);
    }

    function rewardAuditor(address payable auditor, uint256 rewardAmount) public onlyOwner {
        require(address(this).balance >= rewardAmount, "Insufficient balance to reward auditor");
        auditor.transfer(rewardAmount);
        emit AuditorRewarded(auditor, rewardAmount);
    }

    function deposit() public payable {}

    function checkBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // New function to create a new submission and return its ID
    function createNewSubmission() public returns (uint256) {
        uint256 currentSubmissionId = nextSubmissionId++;
        // Logic to handle new submission, can be expanded as per requirement
        return currentSubmissionId;
    }

    // Function to get number of audits for a particular submission
    function getAuditCount(uint256 submissionId) public view returns (uint) {
        return submissionAudits[submissionId].length;
    }
}