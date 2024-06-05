// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract AuditContract is Ownable {
    uint256 public submissionFee;

    event AuditPerformed(address auditor, string auditReport);
    event AuditorRewarded(address auditor, uint256 rewardAmount);

    constructor(uint256 _submissionFee) Ownable() {
        submissionFee = _submissionFee;
    }

    function performAudit(address auditor, string calldata auditReport) public payable {
        require(msg.value == submissionFee, "Incorrect submission fee");
        emit AuditPerformed(auditor, auditReport);
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
}