import React, { useState } from 'react';
import axios from 'axios';

const AuditDashboard: React.FC = () => {
  const [smartContracts, setSmartContracts] = useState<File[]>([]);
  const [contractAuditStatus, setContractAuditStatus] = useState<{ [key: string]: string }>({});
  const [selectedSmartContract, setSelectedSmartContract] = useState<File | null>(null);
  const [auditReportContent, setAuditReportContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSmartContractSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSmartContracts(filesArray);
      setError(''); // Reset errors on new selection
    }
  };

  const submitSmartContractForAudit = async () => {
    if (!selectedSmartContract) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('contract', selectedSmartContract);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/submit-audit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setContractAuditStatus((prevStatus) => ({ ...prevStatus, [selectedSmartContract.name]: 'Pending' }));
      alert('Contract submitted successfully!');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error submitting contract for audit:', error.message);
        setError(`Failed to submit contract: ${error.response?.data || error.message}`);
      } else {
        console.error('Unexpected error submitting contract for audit:', error);
        setError('Unexpected error during submission. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestAuditReport = async (contractName: string) => {
    setIsSubmitting(true);
    setError(''); // Reset previous errors
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/audit-report/${contractName}`);
      setAuditReportContent(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching audit report:', error.message);
        setError(`Failed to fetch report: ${error.response?.data || error.message}`);
      } else {
        console.error('Unexpected error fetching audit report:', error);
        setError('Unexpected error fetching report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayContractsList = () => (
    <ul>
      {smartContracts.map((contract, index) => (
        <li key={index}>
          {contract.name} - Status: {contractAuditStatus[contract.name] || 'Not Submitted'}
          <button onClick={() => setSelectedSmartContract(contract)}>Select</button>
        </li>
      ))}
    </ul>
  );

  const displayError = () => (
    error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>
  );

  const displayAuditReportSection = () => (
    <div>
      <h2>Audit Report</h2>
      <p>{auditReportContent || 'Select a contract to view its audit report.'}</p>
    </div>
  );

  return (
    <div>
      <h1>Smart Contract Audit Dashboard</h1>
      <input type="file" multiple onChange={handleSmartContractSelection} />
      <button disabled={!selectedSmartContract || isSubmitting} onClick={submitSmartContractForAudit}>
        Submit Selected Contract for Audit
      </button>
      {displayError()}
      {displayContractsList()}
      {displayAuditReportSection()}
    </div>
  );
};

export default AuditDashboard;