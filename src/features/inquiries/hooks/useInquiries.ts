import { useState, useEffect } from 'react';
import { getData, addItem, updateItem, deleteItem } from '@/utils/mockData';
import type { Inquiry } from '@/types';

export const useInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const loadInquiries = () => {
    setInquiries(getData<Inquiry>('erp_inquiries'));
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const addInquiry = (inquiry: Omit<Inquiry, 'id' | 'createdAt'>) => {
    const newInquiry: Inquiry = {
      ...inquiry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    addItem('erp_inquiries', newInquiry);
    loadInquiries();
  };

  const updateInquiry = (id: string, updates: Partial<Inquiry>) => {
    updateItem('erp_inquiries', id, updates);
    loadInquiries();
  };

  const deleteInquiry = (id: string) => {
    deleteItem('erp_inquiries', id);
    loadInquiries();
  };

  return {
    inquiries,
    addInquiry,
    updateInquiry,
    deleteInquiry,
  };
};
