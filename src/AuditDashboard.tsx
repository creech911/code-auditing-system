import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuditDashboard: React.FC = () => {
  const [contracts, setContracts] = useState<File[]>([]);
  const [auditStatus, setAuditStatus] = useState<{ [key: string]: string }>({});
  const [selectedContract, setSelectedContract] = useState<File | null>(null);
  const [auditReport, setAuditReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setContracts(filesArray);
    }
  };

  const submitContractForAudit = async () => {
    if (!selectedContract) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('contract', selectedContract);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/submit-audit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAuditStatus((prev) => ({ ...prev, [selectedContract.name]: 'Pending' }));
      alert('Contract submitted successfully!');
    } catch (error) {
      console.error('Error submitting contract for audit:', error);
      alert('Failed to submit contract.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditReport = async (contractName: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/audit-report/${contractName}`);
      setAuditReport(response.data);
    } catch (error) {
      console.error('Error fetching audit report:', error);
      setAuditReport('Failed to fetch report.');
    } finally {
      setLoading(false);
    }
  };

  const renderContractsList = () => (
    <ul>
      {contracts.map((contract, index) => (
        <li key={index}>
          {contract.name} - Status: {auditStatus[contract.name] || 'Not Submitted'}
          <button onClick={() => setSelectedContract(contract)}>Select</button>
        </li>
      ))}
    </ul>
  );

  const renderAuditReportSection = () => (
    <div>
      <h2>Audit Report</h2>
      <p>{auditReport || 'Select a contract to view its audit report.'}</p>
    </div>
  );

  return (
    <div>
      <h1>Smart Contract Audit Dashboard</h1>
      <input type="file" multiple onChange={handleFileSelect} />
      <button disabled={!selectedContract || loading} onClick={submitContractForAudit}>
        Submit Selected Contract for Audit
      </button>
      {renderContractsList()}
      {renderAuditReportSection()}
    </div>
  );
};

export default AuditDashboard;