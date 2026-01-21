import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersAPI } from '../../services/api';
import { Modal, Button, Select, RoleBadge } from '../../components/ui';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
];

export default function RoleEditModal({ isOpen, onClose, user }) {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(user?.role || 'employee');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: ({ id, role }) => usersAPI.updateRole(id, role),
    onSuccess: () => {
      toast.success('User role updated successfully');
      queryClient.invalidateQueries(['users']);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || selectedRole === user.role) {
      onClose();
      return;
    }
    mutation.mutate({ id: user._id, role: selectedRole });
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User Role">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-medium text-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Current role:</span>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* Role Selection */}
        <Select
          label="New Role"
          options={roleOptions}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        />

        {/* Warning for admin role changes */}
        {user.role === 'admin' && selectedRole !== 'admin' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Warning: Demoting an admin will remove their administrative privileges.
            </p>
          </div>
        )}

        {selectedRole === 'admin' && user.role !== 'admin' && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Note: Promoting to admin will grant full system access.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={selectedRole === user.role}
          >
            Update Role
          </Button>
        </div>
      </form>
    </Modal>
  );
}
