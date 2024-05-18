pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract CodeAudit {
    address public contractOwner;
    IERC20 public paymentToken;

    uint256 public submissionFee; // Fee for submitting audit contracts

    struct AuditContract {
        address developer;
        string creationId;
        bool isAudited;
        string auditReportId;
    }

    mapping(uint256 => AuditContract) public auditContracts;
    uint256 public auditContractCount;

    constructor(address paymentTokenAddress, uint256 initialFee) {
        contractOwner = msg.sender;
        paymentToken = IERC20(paymentTokenAddress);
        submissionFee = initialFee; // Setting the initial submission fee
    }

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only contract owner can call this.");
        _;
    }

    event ContractSubmitted(uint256 id, address developer, string creationId);
    event AuditReportPublished(uint256 id, string auditReportId);
    event AuditorRewarded(address auditor, uint256 amount);
    event SubmissionFeeUpdated(uint256 newFee); // Event for fee updates

    function submitAuditContract(string memory creationId) public {
        require(paymentToken.transferFrom(msg.sender, address(this), submissionFee), "Fee payment failed");

        uint256 newContractId = auditContractCount++;
        AuditContract storage newContract = auditContracts[newContractId];
        newContract.developer = msg.sender;
        newContract.creationId = creationId;
        newContract.isAudited = false;

        emit ContractSubmitted(newContractId, msg.sender, creationId);
    }

    function publishAuditResult(uint256 contractId, string memory auditReportId) public {
        AuditContract storage targetContract = auditContracts[contractId];
        require(!targetContract.isAudited, "Contract already audited");
        targetContract.auditReportId = auditReportId;
        targetContract.isAudited = true;

        emit AuditReportPublished(contractId, auditReportId);
    }

    function rewardAuditor(address auditor, uint256 amount) public onlyContractOwner {
        require(paymentToken.transfer(auditor, amount), "Payment transfer failed");
        emit AuditorRewarded(auditor, amount);
    }

    function updateSubmissionFee(uint256 newFee) public onlyContractOwner {
        submissionFee = newFee;
        emit SubmissionFeeUpdated(newFee);
    }
}