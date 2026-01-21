import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { onboardingAPI, usersAPI } from '../../services/api';
import { Modal, Button, Input, Select } from '../../components/ui';

export default function InstanceModal({ isOpen, onClose, templates }) {
  const [form, setForm] = useState({
    employeeId: '',
    templateId: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then(res => res.data),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data) => onboardingAPI.createInstance(data),
    onSuccess: () => {
      toast.success('Onboarding started');
      onClose();
      setForm({
        employeeId: '',
        templateId: '',
        startDate: new Date().toISOString().split('T')[0],
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.templateId) {
      toast.error('Please select an employee and template');
      return;
    }
    mutation.mutate(form);
  };

  const userOptions = usersData?.users?.map(u => ({
    value: u._id,
    label: `${u.name} (${u.email})`,
  })) || [];

  const templateOptions = templates
    .filter(t => t.isActive)
    .map(t => ({
      value: t._id,
      label: `${t.name}${t.department ? ` - ${t.department}` : ''}`,
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Onboarding"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Employee *"
          options={userOptions}
          placeholder="Select employee"
          value={form.employeeId}
          onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
        />

        <Select
          label="Onboarding Template *"
          options={templateOptions}
          placeholder="Select template"
          value={form.templateId}
          onChange={(e) => setForm({ ...form, templateId: e.target.value })}
        />

        <Input
          label="Start Date"
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Start Onboarding
          </Button>
        </div>
      </form>
    </Modal>
  );
}
