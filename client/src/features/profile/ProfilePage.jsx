import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usersAPI } from '../../services/api';
import { PageHeader } from '../../components/layout';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Input, RoleBadge
} from '../../components/ui';

export default function ProfilePage() {
  const { user, loadUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data) => usersAPI.update(user._id, data),
    onSuccess: () => {
      toast.success('Profile updated');
      loadUser();
      setEditing(false);
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    updateMutation.mutate(form);
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      department: user?.department || '',
    });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Your Profile"
        description="Manage your account settings and preferences"
      />

      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <UserCircleIcon className="h-16 w-16 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                    title="Change avatar (coming soon)"
                  >
                    <CameraIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <Input
                      label="Department"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      disabled={user?.role === 'employee'}
                    />
                    <div className="flex space-x-3">
                      <Button type="submit" loading={updateMutation.isPending}>
                        Save Changes
                      </Button>
                      <Button type="button" variant="secondary" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-gray-100">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                      <RoleBadge role={user?.role} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                      <p className="text-gray-900 dark:text-gray-100">{user?.department || 'Not assigned'}</p>
                    </div>
                    <Button variant="secondary" onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Account Type</dt>
                <dd className="mt-1 text-gray-900 dark:text-gray-100 capitalize">
                  {user?.authProvider === 'local' ? 'Email & Password' : `${user?.authProvider} OAuth`}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Account Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Member Since</dt>
                <dd className="mt-1 text-gray-900 dark:text-gray-100">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark themes
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  dark:focus:ring-offset-gray-800
                  ${isDark ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                    transition duration-200 ease-in-out
                    ${isDark ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
