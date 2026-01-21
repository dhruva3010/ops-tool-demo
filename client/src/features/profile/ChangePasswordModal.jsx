import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { Modal, Button, Input } from '../../components/ui';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.changePassword(data);

      // Update tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      toast.success('Password changed successfully!');
      handleClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Password requirements:</p>
          <ul className="list-disc list-inside text-xs">
            <li>At least 6 characters</li>
            <li>At least one uppercase letter</li>
            <li>At least one lowercase letter</li>
            <li>At least one number</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Change Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
