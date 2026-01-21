import { FolderIcon } from '@heroicons/react/24/outline';
import Button from './Button';

export default function EmptyState({
  title = 'No data',
  description = 'Get started by creating your first item.',
  icon: Icon = FolderIcon,
  action,
  actionLabel = 'Create',
}) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action && (
        <div className="mt-6">
          <Button onClick={action}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
