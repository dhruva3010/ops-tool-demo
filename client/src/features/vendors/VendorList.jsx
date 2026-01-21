import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { vendorsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout';
import {
  Card, CardContent, StatusBadge, Button, EmptyState, Spinner
} from '../../components/ui';
import VendorModal from './VendorModal';
import VendorDetail from './VendorDetail';

export default function VendorList() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vendors', search],
    queryFn: () => vendorsAPI.getAll({ search }).then(res => res.data),
  });

  const handleCreate = () => {
    setEditingVendor(null);
    setShowModal(true);
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setShowModal(true);
    setSelectedVendor(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVendor(null);
    refetch();
  };

  if (selectedVendor) {
    return (
      <VendorDetail
        vendorId={selectedVendor._id}
        onBack={() => setSelectedVendor(null)}
        onEdit={() => handleEdit(selectedVendor)}
        onRefresh={refetch}
      />
    );
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          rating >= star ? (
            <StarSolid key={star} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
          )
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Manage your vendor relationships and contracts"
        action={isAdmin() ? handleCreate : null}
        actionLabel="Add Vendor"
        actionIcon={PlusIcon}
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            className="pl-10 input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Vendor Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !data?.vendors?.length ? (
        <EmptyState
          title="No vendors found"
          description={isAdmin() ? "Get started by adding your first vendor." : "No vendors have been added yet."}
          action={isAdmin() ? handleCreate : null}
          actionLabel="Add Vendor"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.vendors.map((vendor) => (
            <Card
              key={vendor._id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedVendor(vendor)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{vendor.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{vendor.category || 'Uncategorized'}</p>
                  </div>
                  <StatusBadge status={vendor.isActive ? 'active' : 'retired'} />
                </div>

                {vendor.rating && (
                  <div className="mt-2">
                    {renderStars(vendor.rating)}
                  </div>
                )}

                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <p>{vendor.contacts?.length || 0} contacts</p>
                  <p>{vendor.contracts?.filter(c => new Date(c.endDate) >= new Date()).length || 0} active contracts</p>
                </div>

                {vendor.website && (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-primary-600 hover:underline block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {vendor.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <VendorModal
        isOpen={showModal}
        onClose={handleCloseModal}
        vendor={editingVendor}
      />
    </div>
  );
}
