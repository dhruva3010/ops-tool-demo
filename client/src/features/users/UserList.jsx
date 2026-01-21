import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { usersAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout';
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
  StatusBadge, RoleBadge, Button, Input, Select, Modal, EmptyState, Spinner
} from '../../components/ui';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
];

export default function UserList() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', search, roleFilter],
    queryFn: () => usersAPI.getAll({ search, role: roleFilter }).then(res => res.data),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => usersAPI.delete(id),
    onSuccess: () => {
      toast.success('User deactivated');
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error deactivating user'),
  });

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage user accounts and permissions"
        action={isAdmin() ? () => setShowModal(true) : null}
        actionLabel="Add User"
        actionIcon={PlusIcon}
      />

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={roleOptions}
          placeholder="All Roles"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={() => { setSearch(''); setRoleFilter(''); }}
        >
          Clear Filters
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !data?.users?.length ? (
        <EmptyState
          title="No users found"
          description="No users match your search criteria."
        />
      ) : (
        <div className="card overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Status</TableHeader>
                {isAdmin() && <TableHeader>Actions</TableHeader>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-8 w-8 rounded-full mr-3"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3">
                          <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><RoleBadge role={user.role} /></TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.isActive ? 'active' : 'retired'} />
                  </TableCell>
                  {isAdmin() && (
                    <TableCell>
                      {user.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to deactivate this user?')) {
                              deactivateMutation.mutate(user._id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Deactivate
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); refetch(); }}
      />
    </div>
  );
}

function CreateUserModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
  });

  const mutation = useMutation({
    mutationFn: (data) => authAPI.register(data),
    onSuccess: () => {
      toast.success('User created');
      onClose();
      setForm({ name: '', email: '', password: '', role: 'employee', department: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error creating user');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in required fields');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Email *"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password *"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Select
          label="Role"
          options={roleOptions}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
        <Input
          label="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );
}
