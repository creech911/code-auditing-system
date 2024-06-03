pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/test-helpers/src/expectRevert.js";

contract AuditContractTest {
  AuditContract auditContract;
  address mockAuditor = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835CB2;
  address mockContractOwner = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
  uint256 submissionFee = 1 ether;

  function beforeEach() public {
    auditContract = new AuditContract(submissionFee);
  }

  function testContractSubmission() public {
    bool success = address(auditContract).send(submissionFee);
    require(success, "Submission failed");
  }

  function testPerformAudit() public {
    address(auditContract).call{value: submissionProcess}("");
    auditContract.performAudit(mockAuditor);
  }

  function testRewardMechanism() public {
    address(auditContract).call{value: submissionProcess}("");
    auditContract.performAudit(mockAuditor);
    auditContract.rewardAuditor(mockAuditor);
  }

  function sendEtherToContract(uint amount) public {
    address(auditContract).call{value: amount}("");
  }

  function testOnlyOwnerCanReward() public {
    sendEtherToContract(submissionFee);
    auditContract.performAudit(mockAuditor);
    (bool success, ) = address(auditContract).call(
      abi.encodeWithSignature("rewardAuditor(address)", mockAuditor)
    );
    require(!success, "Expected transaction to revert");
  }

  receive() external payable {}
  
  fallback() external payable {}
}