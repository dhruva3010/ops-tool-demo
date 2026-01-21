import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { assetsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout';
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
  StatusBadge, Button, Input, Select, EmptyState, Spinner
} from '../../components/ui';
import AssetModal from './AssetModal';
import AssetDetail from './AssetDetail';

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

export default function AssetList() {
  const { isManager } = useAuth();
  const [filters, setFilters] = useState({ search: '', category: '', status: '' });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetsAPI.getAll(filters).then(res => res.data),
  });

  const handleCreate = () => {
    setEditingAsset(null);
    setShowModal(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowModal(true);
    setSelectedAsset(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAsset(null);
    refetch();
  };

  if (selectedAsset) {
    return (
      <AssetDetail
        assetId={selectedAsset._id}
        onBack={() => setSelectedAsset(null)}
        onEdit={() => handleEdit(selectedAsset)}
        onRefresh={refetch}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Manage your organization's assets"
        action={isManager() ? handleCreate : null}
        actionLabel="Add Asset"
        actionIcon={PlusIcon}
      />

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            className="pl-10 input"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <Select
          options={categories}
          placeholder="All Categories"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <Select
          options={statuses}
          placeholder="All Statuses"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        />
        <Button
          variant="secondary"
          onClick={() => setFilters({ search: '', category: '', status: '' })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !data?.assets?.length ? (
        <EmptyState
          title="No assets found"
          description={isManager() ? "Get started by adding your first asset." : "No assets are assigned to you."}
          action={isManager() ? handleCreate : null}
          actionLabel="Add Asset"
        />
      ) : (
        <div className="card overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Serial Number</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Assigned To</TableHeader>
                <TableHeader>Location</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.assets.map((asset) => (
                <TableRow
                  key={asset._id}
                  onClick={() => setSelectedAsset(asset)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell className="capitalize">{asset.category}</TableCell>
                  <TableCell>{asset.serialNumber || '-'}</TableCell>
                  <TableCell><StatusBadge status={asset.status} /></TableCell>
                  <TableCell>{asset.assignedTo?.name || '-'}</TableCell>
                  <TableCell>{asset.location || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AssetModal
        isOpen={showModal}
        onClose={handleCloseModal}
        asset={editingAsset}
      />
    </div>
  );
}
