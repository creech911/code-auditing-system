import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import AuditContractABI from './AuditContractABI.json';

interface Audit {
  id: string;
}

const useAuditContract = () => {
  const [web3Provider, setWebInternetProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [auditContract, setAuditContract] = useState<ethers.Contract | null>(null);
  const [auditRecords, setAuditRecords] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const logError = (message: string, consoleMsg: string) => {
    console.error(consoleMsg);
    setError(message);
  };

  const initializeWalletConnection = useCallback(async () => {
    if (!window.ethereum) {
      return logError("Ethereum object doesn't exist in the window context.", "Ethereum object doesn't exist!");
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setWeb3Provider(web3Provider);
      const signer = web3Provider.getSigner();
      
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        return logError('Contract address is not provided in environment variables.', 'Contract address is missing.');
      }

      const auditContract = new ethers.Contract(contractAddress, AuditContractABI, signer);
      setAuditContract(auditContract);
    } catch (error) {
      logError('Failed to connect wallet. Please try again.', 'Failed to connect wallet: ' + error);
    }
  }, []);

  useEffect(() => {
    initializeWalletConnection();
  }, [initializeWalletConnection]);

  const performContractInteraction = async (action: Function, errorMessage: string) => {
    if (!auditContract) {
      return setError('Audit contract not initialized');
    }
    setIsLoading(true);
    try {
      await action();
    } catch (error) {
      logError(errorMessage, error.message);
    }
    setIsLoading(false);
  };

  const submitAuditRecord = useCallback(async (auditData: any) => {
    performContractInteraction(async () => {
      const transaction = await auditContract.submitAudit(auditData);
      await transaction.wait();
    }, 'Error submitting audit record. Please try again.');
  }, [auditContract]);

  const retrieveAuditStatus = useCallback(async (auditId: string) => {
    performContractInteraction(async () => {
      const status = await auditContract.auditStatus(auditId);
      console.log(`Status of audit ${auditId}:`, status);
    }, 'Error retrieving audit status. Please try again.');
  }, [auditContract]);

  const retrieveCompletedAudits = useCallback(async () => {
    performContractInteraction(async () => {
      const completedAudits = await auditContract.getCompletedAudits();
      setAuditRecords(completedAudits.map((audit: any) => ({
        id: audit.id.toString(),
      })));
    }, 'Error retrieving completed audits. Please try again.');
  }, [auditContract]);

  useEffect(() => {
    retrieveCompletedAudits();
  }, [retrieveCompletedAudits]);

  return { isLoading, auditRecords, submitAuditRecord, retrieveAuditStatus, retrieveCompletedAudits, error, connectWallet: initializeWalletConnection };
};

export default useAuditContract;