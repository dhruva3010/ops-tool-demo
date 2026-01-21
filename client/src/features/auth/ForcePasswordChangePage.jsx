import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { KeyIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button, Input } from '../../components/ui';

export default function ForcePasswordChangePage() {
  const { completePasswordChange, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await completePasswordChange(data);
      toast.success('Password changed successfully!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <SunIcon className="h-6 w-6" />
        ) : (
          <MoonIcon className="h-6 w-6" />
        )}
      </button>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <KeyIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Password Change Required
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            For security reasons, you must change your password before continuing.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              autoComplete="current-password"
              {...register('currentPassword', {
                required: 'Current password is required',
              })}
              error={errors.currentPassword?.message}
            />

            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain uppercase, lowercase, and number',
                },
              })}
              error={errors.newPassword?.message}
            />

            <Input
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (value) =>
                  value === newPassword || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside">
              <li>At least 6 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Change Password
            </Button>

            <button
              type="button"
              onClick={logout}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Sign out instead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
