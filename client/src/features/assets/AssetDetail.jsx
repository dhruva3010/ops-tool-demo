import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { assetsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Button, Card, CardHeader, CardTitle, CardContent,
  StatusBadge, Badge, Modal, Input, Select, Spinner
} from '../../components/ui';

export default function AssetDetail({ assetId, onBack, onEdit, onRefresh }) {
  const { isManager } = useAuth();
  const queryClient = useQueryClient();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => assetsAPI.getOne(assetId).then(res => res.data),
  });

  const asset = data?.asset;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!asset) {
    return <div>Asset not found</div>;
  }

  const formatDate = (date) => date ? format(new Date(date), 'MMM d, yyyy') : '-';
  const formatCurrency = (value) => value ? `$${value.toLocaleString()}` : '-';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Assets
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{asset.name}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <StatusBadge status={asset.status} />
              <Badge variant="blue" className="capitalize">{asset.category}</Badge>
            </div>
          </div>
          {isManager() && (
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => setShowQRModal(true)}>
                <QrCodeIcon className="h-5 w-5 mr-2" />
                QR Code
              </Button>
              <Button variant="secondary" onClick={() => setShowMaintenanceModal(true)}>
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                Maintenance
              </Button>
              <Button variant="secondary" onClick={() => setShowAssignModal(true)}>
                <UserPlusIcon className="h-5 w-5 mr-2" />
                {asset.assignedTo ? 'Reassign' : 'Assign'}
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
              <CardTitle>Asset Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Serial Number</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">{asset.serialNumber || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Location</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">{asset.location || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Purchase Date</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">{formatDate(asset.purchaseDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Purchase Price</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">{formatCurrency(asset.purchasePrice)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Current Value</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">{formatCurrency(asset.currentValue)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Warranty Expiry</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">{formatDate(asset.warrantyExpiry)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Vendor</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">{asset.vendor?.name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Depreciation Rate</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">{asset.depreciationRate ? `${asset.depreciationRate}%` : '-'}</dd>
                </div>
              </dl>
              {asset.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Notes</dt>
                  <dd className="mt-1 text-gray-900 dark:text-gray-100">{asset.notes}</dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance History */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              {asset.maintenanceHistory?.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {asset.maintenanceHistory.map((record, index) => (
                    <li key={index} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{record.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {record.performedBy && `By ${record.performedBy}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(record.date)}</p>
                          {record.cost > 0 && (
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(record.cost)}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No maintenance records</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {asset.assignedTo ? (
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{asset.assignedTo.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{asset.assignedTo.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Assigned on {formatDate(asset.assignedDate)}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Not assigned</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Created By</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-gray-900 dark:text-gray-100">{asset.createdBy?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(asset.createdAt)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        asset={asset}
        onSuccess={() => {
          queryClient.invalidateQueries(['asset', assetId]);
          onRefresh();
        }}
      />

      <MaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        asset={asset}
        onSuccess={() => {
          queryClient.invalidateQueries(['asset', assetId]);
        }}
      />

      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        assetId={assetId}
      />
    </div>
  );
}

function AssignModal({ isOpen, onClose, asset, onSuccess }) {
  const [userId, setUserId] = useState('');

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then(res => res.data),
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: () => assetsAPI.assign(asset._id, userId),
    onSuccess: () => {
      toast.success('Asset assigned');
      onSuccess();
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error assigning asset'),
  });

  const unassignMutation = useMutation({
    mutationFn: () => assetsAPI.unassign(asset._id),
    onSuccess: () => {
      toast.success('Asset unassigned');
      onSuccess();
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error unassigning asset'),
  });

  const userOptions = usersData?.users?.map(u => ({
    value: u._id,
    label: `${u.name} (${u.email})`,
  })) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Asset">
      <div className="space-y-4">
        <Select
          label="Assign to"
          options={userOptions}
          placeholder="Select user"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <div className="flex justify-end space-x-3">
          {asset.assignedTo && (
            <Button
              variant="danger"
              onClick={() => unassignMutation.mutate()}
              loading={unassignMutation.isPending}
            >
              Unassign
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => assignMutation.mutate()}
            loading={assignMutation.isPending}
            disabled={!userId}
          >
            Assign
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function MaintenanceModal({ isOpen, onClose, asset, onSuccess }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: '',
    performedBy: '',
  });

  const mutation = useMutation({
    mutationFn: () => assetsAPI.addMaintenance(asset._id, form),
    onSuccess: () => {
      toast.success('Maintenance record added');
      onSuccess();
      onClose();
      setForm({ date: new Date().toISOString().split('T')[0], description: '', cost: '', performedBy: '' });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error adding maintenance'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Maintenance Record">
      <div className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <div>
          <label className="label">Description *</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <Input
          label="Cost"
          type="number"
          step="0.01"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
        />
        <Input
          label="Performed By"
          value={form.performedBy}
          onChange={(e) => setForm({ ...form, performedBy: e.target.value })}
        />
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!form.description}
          >
            Add Record
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function QRModal({ isOpen, onClose, assetId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['asset-qr', assetId],
    queryFn: () => assetsAPI.getQR(assetId).then(res => res.data),
    enabled: isOpen,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asset QR Code">
      <div className="text-center">
        {isLoading ? (
          <Spinner />
        ) : data?.qrCode ? (
          <div>
            <img src={data.qrCode} alt="QR Code" className="mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Scan this QR code to quickly access asset information
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                const link = document.createElement('a');
                link.download = `asset-qr-${assetId}.png`;
                link.href = data.qrCode;
                link.click();
              }}
            >
              Download QR Code
            </Button>
          </div>
        ) : (
          <p>Unable to generate QR code</p>
        )}
      </div>
    </Modal>
  );
}
