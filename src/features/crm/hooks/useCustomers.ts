import { useState, useEffect } from 'react';
import { getData, addItem, updateItem, deleteItem } from '@/utils/mockData';
import type { Customer } from '@/types';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const loadCustomers = () => {
    setCustomers(getData<Customer>('erp_customers'));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
    };
    addItem('erp_customers', newCustomer);
    loadCustomers();
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    updateItem('erp_customers', id, updates);
    loadCustomers();
  };

  const deleteCustomer = (id: string) => {
    deleteItem('erp_customers', id);
    loadCustomers();
  };

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
