import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { vendorsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Button, Card, CardHeader, CardTitle, CardContent,
  StatusBadge, Badge, Modal, Input, Spinner
} from '../../components/ui';

export default function VendorDetail({ vendorId, onBack, onEdit, onRefresh }) {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [showContractModal, setShowContractModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => vendorsAPI.getOne(vendorId).then(res => res.data),
  });

  const vendor = data?.vendor;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!vendor) {
    return <div>Vendor not found</div>;
  }

  const formatDate = (date) => date ? format(new Date(date), 'MMM d, yyyy') : '-';
  const formatCurrency = (value) => value ? `$${value.toLocaleString()}` : '-';

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        rating >= star ? (
          <StarSolid key={star} className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarIcon key={star} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
        )
      ))}
    </div>
  );

  const isContractActive = (contract) => new Date(contract.endDate) >= new Date();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Vendors
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{vendor.name}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <StatusBadge status={vendor.isActive ? 'active' : 'retired'} />
              {vendor.category && <Badge variant="blue">{vendor.category}</Badge>}
              {vendor.rating > 0 && renderStars(vendor.rating)}
            </div>
          </div>
          {isAdmin() && (
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => setShowContractModal(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Contract
              </Button>
              <Button onClick={onEdit}>
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Address</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">{vendor.address || '-'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Website</dt>
                  <dd className="mt-1">
                    {vendor.website ? (
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {vendor.website}
                      </a>
                    ) : <span className="text-gray-900 dark:text-gray-100">-</span>}
                  </dd>
                </div>
              </dl>
              {vendor.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Notes</dt>
                  <dd className="mt-1 text-gray-900 dark:text-gray-100">{vendor.notes}</dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contracts */}
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.contracts?.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {vendor.contracts.map((contract) => (
                    <ContractItem
                      key={contract._id}
                      contract={contract}
                      vendorId={vendorId}
                      isActive={isContractActive(contract)}
                      onDelete={() => {
                        queryClient.invalidateQueries(['vendor', vendorId]);
                        onRefresh();
                      }}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No contracts</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Contacts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.contacts?.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {vendor.contacts.map((contact, index) => (
                    <li key={index} className="py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{contact.name}</p>
                      {contact.role && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{contact.role}</p>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline block mt-1"
                        >
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-sm text-gray-600 dark:text-gray-400 block"
                        >
                          {contact.phone}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No contacts</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Contract Modal */}
      <ContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        vendorId={vendorId}
        onSuccess={() => {
          queryClient.invalidateQueries(['vendor', vendorId]);
          onRefresh();
        }}
      />
    </div>
  );
}

function ContractItem({ contract, vendorId, isActive, onDelete }) {
  const { isAdmin } = useAuth();

  const deleteMutation = useMutation({
    mutationFn: () => vendorsAPI.deleteContract(vendorId, contract._id),
    onSuccess: () => {
      toast.success('Contract deleted');
      onDelete();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error deleting contract'),
  });

  const formatDate = (date) => format(new Date(date), 'MMM d, yyyy');
  const formatCurrency = (value) => value ? `$${value.toLocaleString()}` : '-';

  return (
    <li className="py-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900 dark:text-gray-100">{contract.title}</p>
            <Badge variant={isActive ? 'green' : 'gray'}>
              {isActive ? 'Active' : 'Expired'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
          </p>
          <p className="text-sm font-medium mt-1 text-gray-900 dark:text-gray-100">{formatCurrency(contract.value)}</p>
        </div>
        {isAdmin() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            loading={deleteMutation.isPending}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </li>
  );
}

function ContractModal({ isOpen, onClose, vendorId, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    value: '',
  });

  const mutation = useMutation({
    mutationFn: () => vendorsAPI.addContract(vendorId, form),
    onSuccess: () => {
      toast.success('Contract added');
      onSuccess();
      onClose();
      setForm({ title: '', startDate: '', endDate: '', value: '' });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error adding contract'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error('Please fill in required fields');
      return;
    }
    mutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Contract">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Contract Title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <Input
            label="End Date *"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
        <Input
          label="Value"
          type="number"
          step="0.01"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Add Contract
          </Button>
        </div>
      </form>
    </Modal>
  );
}
