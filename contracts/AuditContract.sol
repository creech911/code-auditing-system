pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract CodeAudit {
    address public contractOwner;
    IERC20 public paymentToken;

    struct AuditContract {
        address developer;
        string creationId; // Previously 'cid', now more descriptive
        bool isAudited;
        string auditReportId; // Changed from auditReportCID for consistency
    }

    mapping(uint256 => AuditContract) public auditContracts;
    uint256 public auditContractCount;

    constructor(address paymentTokenAddress) {
        contractOwner = msg.sender;
        paymentToken = IERC20(paymentTokenAddress);
    }

    modifier onlyContractOwner() { // More descriptive name for the modifier
        require(msg.sender == contractOwner, "Only contract owner can call this.");
        _;
    }

    event ContractSubmitted(uint256 id, address developer, string creationId);
    event AuditReportPublished(uint256 id, string auditReportId);
    event AuditorRewarded(address auditor, uint256 amount);

    function submitAuditContract(string memory creationId) public { // More descriptive function name
        uint256 newContractId = auditContractCount++;
        AuditContract storage newContract = auditContracts[newContractId];
        newContract.developer = msg.sender;
        newContract.creationId = creationId;
        newContract.isAudited = false;

        emit ContractSubmitted(newContractId, msg.sender, creationId);
    }

    function publishAuditResult(uint256 contractId, string memory auditReportId) public { // More descriptive name
        AuditContract storage targetContract = auditContracts[contractId];
        require(!targetContract.isAudited, "Contract already audited");
        targetContract.auditReportId = auditReportId;
        targetContract.isAudited = true;

        emit AuditReportPublished(contractId, auditReportId);
    }

    function rewardAuditor(address auditor, uint256 amount) public onlyContractOwner { // Changed for clarity
        require(paymentToken.transfer(auditor, amount), "Payment transfer failed");

        emit AuditorRewarded(auditor, amount);
    }
}