// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

contract AuditContract {
    uint256 public submissionFee;

    constructor(uint256 _submissionFee) {
        submissionFee = _submissionFee;
    }

    function performAudit(address auditor) public {
    }

    function rewardAuditor(address auditor) public {
    }
}

contract AuditContractTest {
    AuditContract auditContract;
    address mockAuditor = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835CB2;
    address mockContractOwner = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C01db;
    uint256 submissionFee = 1 ether;

    function beforeEach() public {
        auditContract = new AuditContract(submissionFee);
    }

    function testContractSubmission() public {
        (bool success, ) = address(auditContract).call{value: submissionFee}("");
        require(success, "Submission failed");
    }

    function testPerformAudit() public payable {
        (bool success,) = address(auditContract).call{value: submissionFee}("");
        require(success, "Failed to send Ether for audit submission.");
        auditContract.performAudit(mockAuditor);
    }

    function testRewardMechanism() public {
        testPerformAudit();
        auditContract.rewardAuditor(mockAuditor);
    }

    function sendEtherToContract(uint amount) public payable {
        (bool success,) = address(auditContract).call{value: amount}("");
        require(success, "Failed to send Ether to contract.");
    }

    function testOnlyOwnerCanReward() public {
        sendEtherToContract(submissionFee);
        auditContract.performAudit(mockAuditor);

        try auditContract.rewardAuditor(mockAuditor) {
            require(false, "Rewards should only be possible for the owner");
        } catch {
        }
    }

    receive() external payable {}
  
    fallback() external payable {}
}