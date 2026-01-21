import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { onboardingAPI } from '../../services/api';
import { Modal, Button, Input, Select } from '../../components/ui';

const assigneeRoles = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
];

export default function TemplateModal({ isOpen, onClose, template }) {
  const isEditing = !!template;

  const [form, setForm] = useState({
    name: '',
    department: '',
    role: '',
    tasks: [{ title: '', description: '', dueInDays: 7, assigneeRole: 'employee' }],
  });

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name,
        department: template.department || '',
        role: template.role || '',
        tasks: template.tasks?.length > 0 ? template.tasks : [{ title: '', description: '', dueInDays: 7, assigneeRole: 'employee' }],
      });
    } else {
      setForm({
        name: '',
        department: '',
        role: '',
        tasks: [{ title: '', description: '', dueInDays: 7, assigneeRole: 'employee' }],
      });
    }
  }, [template]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEditing
        ? onboardingAPI.updateTemplate(template._id, data)
        : onboardingAPI.createTemplate(data),
    onSuccess: () => {
      toast.success(isEditing ? 'Template updated' : 'Template created');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const addTask = () => {
    setForm({
      ...form,
      tasks: [...form.tasks, { title: '', description: '', dueInDays: 7, assigneeRole: 'employee' }],
    });
  };

  const removeTask = (index) => {
    setForm({
      ...form,
      tasks: form.tasks.filter((_, i) => i !== index),
    });
  };

  const updateTask = (index, field, value) => {
    const newTasks = [...form.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setForm({ ...form, tasks: newTasks });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (form.tasks.some(t => !t.title.trim())) {
      toast.error('All tasks must have a title');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Template' : 'Create Onboarding Template'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Template Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />
          <Input
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="label mb-0">Tasks *</label>
            <Button type="button" variant="ghost" size="sm" onClick={addTask}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {form.tasks.map((task, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Task title"
                    className="flex-1"
                    value={task.title}
                    onChange={(e) => updateTask(index, 'title', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Days"
                    className="w-20"
                    value={task.dueInDays}
                    onChange={(e) => updateTask(index, 'dueInDays', parseInt(e.target.value) || 1)}
                  />
                  <Select
                    options={assigneeRoles}
                    className="w-32"
                    value={task.assigneeRole}
                    onChange={(e) => updateTask(index, 'assigneeRole', e.target.value)}
                  />
                  {form.tasks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <textarea
                  placeholder="Task description (optional)"
                  className="input text-sm"
                  rows={2}
                  value={task.description}
                  onChange={(e) => updateTask(index, 'description', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEditing ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </form>
    </Modal>
  );
}
