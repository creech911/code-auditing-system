pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract CodeAudit {
    address public owner;
    IERC20 public paymentToken;

    struct SmartContract {
        address developer;
        string cid;
        bool audited;
        string auditReportCID;
    }

    mapping(uint256 => SmartContract) public smartContracts;
    uint256 public smartContractCount;

    constructor(address _paymentTokenAddress) {
        owner = msg.sender;
        paymentToken = IERC20(_paymentTokenAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this.");
        _;
    }

    event ContractSubmitted(uint256 id, address developer, string cid);
    event AuditReportPublished(uint256 id, string auditReportCID);
    event AuditorCompensated(address auditor, uint256 amount);

    function submitContract(string memory _cid) public {
        uint256 newContractId = smartContractCount++;
        SmartContract storage newContract = smartContracts[newContractId];
        newContract.developer = msg.sender;
        newContract.cid = _cid;
        newContract.audited = false;

        emit ContractSubmitted(newContractId, msg.sender, _cid);
    }

    function postAuditResult(uint256 _id, string memory _auditReportCID) public {
        SmartContract storage sContract = smartContracts[_id];
        require(!sContract.audited, "Already audited");
        sContract.auditReportCID = _auditReportCID;
        sContract.audited = true;

        emit AuditReportPublished(_id, _auditReportCID);
    }

    function compensateAuditor(address _auditor, uint256 _amount) public onlyOwner {
        require(paymentToken.transfer(_auditor, _amount), "Payment failed");

        emit AuditorCompensated(_auditor, _amount);
    }
}