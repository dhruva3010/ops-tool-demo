import Button from '../ui/Button';

export default function PageHeader({
  title,
  description,
  action,
  actionLabel,
  actionIcon: ActionIcon,
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {action && (
          <div className="mt-4 sm:mt-0">
            <Button onClick={action}>
              {ActionIcon && <ActionIcon className="h-5 w-5 mr-2" />}
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
