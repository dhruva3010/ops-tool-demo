import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          block w-full rounded-lg border shadow-sm sm:text-sm
          focus:ring-2 focus:ring-offset-0
          dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:focus:border-primary-500'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
