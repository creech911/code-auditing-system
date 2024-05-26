import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import AuditContractABI from './AuditContractABI.json';

const useAuditContract = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS!, AuditContractABI, signer);
          setContract(contract);
        } else {
          console.error("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.error('Failed to initialize the provider or contract:', error);
      }
    };
    init();
  }, []);

  const submitAudit = useCallback(async (auditData: any) => {
    if (!contract) return;
    setLoading(true);
    try {
      const transaction = await contract.submitAudit(auditData);
      await transaction.wait();
    } catch (error) {
      console.error('Error submitting audit:', error);
    }
    setLoading(false);
  }, [contract]);

  const fetchAuditStatus = useCallback(async (auditId: string) => {
    if (!contract) return;
    setLoading(true);
    try {
      const status = await contract.auditStatus(auditId);
      console.log(`Status of audit ${auditId}:`, status);
    } catch (error) {
      console.error('Error fetching audit status:', error);
    }
    setLoading(false);
  }, [contract]);

  const fetchCompletedAudits = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const completedAudits = await contract.getCompletedAudits();
      setAudits(completedAudits);
    } catch (error) {
      console.error('Error fetching completed audits:', error);
    }
    setLoading(false);
  }, [contract]);

  useEffect(() => {
    fetchCompletedAudits();
  }, [fetchCompletedAudits]);

  return { loading, audits, submitAudit, fetchAuditStatus, fetchCompletedAudits };
};

export default useAuditContract;