import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { onboardingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Button, Card, CardHeader, CardTitle, CardContent,
  StatusBadge, Spinner
} from '../../components/ui';

export default function OnboardingDetail({ instanceId, onBack, onRefresh }) {
  const { user, isManager } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding-instance', instanceId],
    queryFn: () => onboardingAPI.getInstance(instanceId).then(res => res.data),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }) =>
      onboardingAPI.updateTask(instanceId, taskId, { status }),
    onSuccess: () => {
      toast.success('Task updated');
      queryClient.invalidateQueries(['onboarding-instance', instanceId]);
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error updating task');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => onboardingAPI.cancelInstance(instanceId),
    onSuccess: () => {
      toast.success('Onboarding cancelled');
      onBack();
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error cancelling onboarding');
    },
  });

  const instance = data?.instance;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!instance) {
    return <div>Onboarding not found</div>;
  }

  const formatDate = (date) => date ? format(new Date(date), 'MMM d, yyyy') : '-';

  const canUpdateTask = (task) => {
    // Employees can only update their own tasks
    if (user.role === 'employee') {
      return instance.employee._id === user._id || task.assignee?._id === user._id;
    }
    return true;
  };

  const getTaskIcon = (task) => {
    if (task.status === 'completed') {
      return <CheckCircleSolid className="h-6 w-6 text-green-500" />;
    }
    if (task.status === 'in-progress') {
      return <ClockIcon className="h-6 w-6 text-blue-500" />;
    }
    return <CheckCircleIcon className="h-6 w-6 text-gray-300 dark:text-gray-600" />;
  };

  const isOverdue = (task) => {
    return task.status !== 'completed' && new Date(task.dueDate) < new Date();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Onboarding
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {instance.employee?.name}'s Onboarding
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {instance.template?.name} - Started {formatDate(instance.startDate)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <StatusBadge status={instance.status} />
            {isManager() && instance.status === 'active' && (
              <Button
                variant="danger"
                onClick={() => cancelMutation.mutate()}
                loading={cancelMutation.isPending}
              >
                Cancel Onboarding
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{instance.progress}% Complete</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-3 bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${instance.progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {instance.tasks?.map((task) => (
              <li
                key={task._id}
                className={`p-4 ${isOverdue(task) ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {getTaskIcon(task)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${task.status === 'completed' ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {isOverdue(task) && (
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">Overdue</span>
                        )}
                        <span className={`text-sm ${isOverdue(task) ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          Due: {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {task.assignee ? `Assigned to: ${task.assignee.name}` : 'Unassigned'}
                      </span>
                      {canUpdateTask(task) && instance.status === 'active' && (
                        <div className="flex space-x-2">
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateTaskMutation.mutate({ taskId: task._id, status: 'in-progress' })}
                              loading={updateTaskMutation.isPending}
                            >
                              Start
                            </Button>
                          )}
                          {task.status === 'in-progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateTaskMutation.mutate({ taskId: task._id, status: 'completed' })}
                              loading={updateTaskMutation.isPending}
                            >
                              Complete
                            </Button>
                          )}
                          {task.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateTaskMutation.mutate({ taskId: task._id, status: 'pending' })}
                              loading={updateTaskMutation.isPending}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {task.completedAt && (
                      <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                        Completed on {formatDate(task.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
