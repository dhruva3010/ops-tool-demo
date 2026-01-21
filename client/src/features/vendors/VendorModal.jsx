import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { vendorsAPI } from '../../services/api';
import { Modal, Button, Input } from '../../components/ui';

export default function VendorModal({ isOpen, onClose, vendor }) {
  const isEditing = !!vendor;

  const [form, setForm] = useState({
    name: '',
    category: '',
    address: '',
    website: '',
    rating: 0,
    notes: '',
    contacts: [],
  });

  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name,
        category: vendor.category || '',
        address: vendor.address || '',
        website: vendor.website || '',
        rating: vendor.rating || 0,
        notes: vendor.notes || '',
        contacts: vendor.contacts || [],
      });
    } else {
      setForm({
        name: '',
        category: '',
        address: '',
        website: '',
        rating: 0,
        notes: '',
        contacts: [],
      });
    }
  }, [vendor]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEditing
        ? vendorsAPI.update(vendor._id, data)
        : vendorsAPI.create(data),
    onSuccess: () => {
      toast.success(isEditing ? 'Vendor updated' : 'Vendor created');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const addContact = () => {
    setForm({
      ...form,
      contacts: [...form.contacts, { name: '', email: '', phone: '', role: '' }],
    });
  };

  const removeContact = (index) => {
    setForm({
      ...form,
      contacts: form.contacts.filter((_, i) => i !== index),
    });
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...form.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setForm({ ...form, contacts: newContacts });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vendor name is required');
      return;
    }
    mutation.mutate(form);
  };

  const renderRatingInput = () => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setForm({ ...form, rating: star })}
          className="focus:outline-none"
        >
          {form.rating >= star ? (
            <StarSolid className="h-6 w-6 text-yellow-400" />
          ) : (
            <StarIcon className="h-6 w-6 text-gray-300 dark:text-gray-600 hover:text-yellow-400" />
          )}
        </button>
      ))}
      {form.rating > 0 && (
        <button
          type="button"
          onClick={() => setForm({ ...form, rating: 0 })}
          className="text-sm text-gray-500 dark:text-gray-400 ml-2 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Clear
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Vendor' : 'Add New Vendor'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Vendor Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g., IT Services, Office Supplies"
          />
        </div>

        <div>
          <label className="label">Rating</label>
          {renderRatingInput()}
        </div>

        <Input
          label="Website"
          type="url"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          placeholder="https://..."
        />

        <div>
          <label className="label">Address</label>
          <textarea
            className="input"
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        {/* Contacts */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="label mb-0">Contacts</label>
            <Button type="button" variant="ghost" size="sm" onClick={addContact}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Contact
            </Button>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto">
            {form.contacts.map((contact, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Name"
                    className="flex-1"
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Role"
                    className="w-32"
                    value={contact.role}
                    onChange={(e) => updateContact(index, 'role', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    className="flex-1"
                    value={contact.email}
                    onChange={(e) => updateContact(index, 'email', e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    className="w-40"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEditing ? 'Update' : 'Create'} Vendor
          </Button>
        </div>
      </form>
    </Modal>
  );
}
