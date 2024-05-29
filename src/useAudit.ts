import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import AuditContractABI from './AuditContractABI.json';

interface Audit {
  id: string;
}

const useAuditContract = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS!, AuditContractABI, signer);
        setContract(contract);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        setError('Failed to connect wallet. Please try again.');
      }
    } else {
      console.error("Ethereum object doesn't exist!");
      setError("Ethereum object doesn't exist in the window context.");
    }
  }, []);

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  const submitAudit = useCallback(async (auditData: any) => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }
    setLoading(true);
    try {
      const transaction = await contract.submitAudit(auditData);
      await transaction.wait();
    } catch (error) {
      console.error('Error submitting audit:', error);
      setError('Error submitting audit. Please try again.');
    }
    setLoading(false);
  }, [contract]);

  const fetchAuditStatus = useCallback(async (auditId: string) => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }
    setLoading(true);
    try {
      const status = await contract.auditStatus(auditId);
      console.log(`Status of audit ${auditId}:`, status);
    } catch (error) {
      console.error('Error fetching audit status:', error);
      setError('Error fetching audit status. Please try again.');
    }
    setLoading(false);
  }, [contract]);

  const fetchCompletedAudits = useCallback(async () => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }
    setLoading(true);
    try {
      const completedAudits = await contract.getCompletedAudits();
      setAudits(completedAudits.map((audit: any) => ({
        id: audit.id,
      })));
    } catch (error) {
      console.error('Error fetching completed audits:', error);
      setError('Error fetching completed audits. Please try again.');
    }
    setLoading(false);
  }, [contract]);

  useEffect(() => {
    fetchCompletedAudits();
  }, [fetchCompletedAudits]);

  return { loading, audits, submitAudit, fetchAuditStatus, fetchCompletedAudits, error, connectWallet };
};

export default useAuditContract;