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

  const throwError = (message: string, consoleMsg: string) => {
    console.error(consoleMsg);
    setError(message);
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      return throwError("Ethereum object doesn't exist in the window context.", "Ethereum object doesn't exist!");
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        return throwError('Contract address is not provided in environment variables.', 'Contract address is missing.');
      }

      const contract = new ethers.Contract(contractAddress, AuditContractABI, signer);
      setContract(contract);
    } catch (error) {
      throwError('Failed to connect wallet. Please try again.', 'Failed to connect wallet: ' + error);
    }
  }, []);

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  const handleContractInteraction = async (action: Function, errorMessage: string) => {
    if (!contract) {
      return setError('Contract not initialized');
    }
    setLoading(true);
    try {
      await action();
    } catch (error) {
      throwError(errorMessage, error.message);
    }
    setLoading(false);
  };

  const submitAudit = useCallback(async (auditData: any) => {
    handleContractInteraction(async () => {
      const transaction = await contract.submitAudit(auditData);
      await transaction.wait();
    }, 'Error submitting audit. Please try again.');
  }, [contract]);

  const fetchAuditStatus = useCallback(async (auditId: string) => {
    handleContractInteraction(async () => {
      const status = await contract.auditStatus(auditId);
      console.log(`Status of audit ${auditId}:`, status);
    }, 'Error fetching audit status. Please try again.');
  }, [contract]);

  const fetchCompletedAudits = useCallback(async () => {
    handleContractInteraction(async () => {
      const completedAudits = await contract.getCompletedAudits();
      setAudits(completedAudits.map((audit: any) => ({
        id: audit.id.toString(),
      })));
    }, 'Error fetching completed audits. Please try again.');
  }, [contract]);

  useEffect(() => {
    fetchCompletedAudits();
  }, [fetchCompletedAudits]);

  return { loading, audits, submitAudit, fetchAuditStatus, fetchCompletedAudits, error, connectWallet };
};

export default useAuditContract;