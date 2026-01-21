import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { assetsAPI, vendorsAPI } from '../../services/api';
import { Modal, Button, Input, Select } from '../../components/ui';

const categories = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
];

const statuses = [
  { value: 'available', label: 'Available' },
  { value: 'in-use', label: 'In Use' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
];

export default function AssetModal({ isOpen, onClose, asset }) {
  const isEditing = !!asset;

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsAPI.getAll({ isActive: true }).then(res => res.data),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (asset) {
      reset({
        name: asset.name,
        category: asset.category,
        serialNumber: asset.serialNumber || '',
        status: asset.status,
        location: asset.location || '',
        purchaseDate: asset.purchaseDate?.split('T')[0] || '',
        purchasePrice: asset.purchasePrice || '',
        warrantyExpiry: asset.warrantyExpiry?.split('T')[0] || '',
        depreciationRate: asset.depreciationRate || '',
        vendor: asset.vendor?._id || '',
        notes: asset.notes || '',
      });
    } else {
      reset({
        name: '',
        category: '',
        serialNumber: '',
        status: 'available',
        location: '',
        purchaseDate: '',
        purchasePrice: '',
        warrantyExpiry: '',
        depreciationRate: '',
        vendor: '',
        notes: '',
      });
    }
  }, [asset, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEditing
        ? assetsAPI.update(asset._id, data)
        : assetsAPI.create(data),
    onSuccess: () => {
      toast.success(isEditing ? 'Asset updated' : 'Asset created');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const onSubmit = (data) => {
    // Clean up empty values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== '')
    );
    mutation.mutate(cleanData);
  };

  const vendorOptions = vendorsData?.vendors?.map(v => ({
    value: v._id,
    label: v.name,
  })) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Asset' : 'Add New Asset'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Asset Name *"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <Select
            label="Category *"
            options={categories}
            {...register('category', { required: 'Category is required' })}
            error={errors.category?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Serial Number"
            {...register('serialNumber')}
          />
          <Select
            label="Status"
            options={statuses}
            {...register('status')}
          />
        </div>

        <Input
          label="Location"
          {...register('location')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            {...register('purchaseDate')}
          />
          <Input
            label="Purchase Price"
            type="number"
            step="0.01"
            {...register('purchasePrice')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Warranty Expiry"
            type="date"
            {...register('warrantyExpiry')}
          />
          <Input
            label="Depreciation Rate (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            {...register('depreciationRate')}
          />
        </div>

        <Select
          label="Vendor"
          options={vendorOptions}
          placeholder="Select vendor"
          {...register('vendor')}
        />

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input"
            rows={3}
            {...register('notes')}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEditing ? 'Update' : 'Create'} Asset
          </Button>
        </div>
      </form>
    </Modal>
  );
}
