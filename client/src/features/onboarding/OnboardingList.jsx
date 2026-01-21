import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tab } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { onboardingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout';
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
  StatusBadge, Button, EmptyState, Spinner, Card, CardContent
} from '../../components/ui';
import TemplateModal from './TemplateModal';
import InstanceModal from './InstanceModal';
import OnboardingDetail from './OnboardingDetail';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function OnboardingList() {
  const { isAdmin, isManager } = useAuth();
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const { data: templatesData, isLoading: loadingTemplates, refetch: refetchTemplates } = useQuery({
    queryKey: ['onboarding-templates'],
    queryFn: () => onboardingAPI.getTemplates().then(res => res.data),
  });

  const { data: instancesData, isLoading: loadingInstances, refetch: refetchInstances } = useQuery({
    queryKey: ['onboarding-instances'],
    queryFn: () => onboardingAPI.getInstances().then(res => res.data),
  });

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowTemplateModal(true);
  };

  if (selectedInstance) {
    return (
      <OnboardingDetail
        instanceId={selectedInstance._id}
        onBack={() => setSelectedInstance(null)}
        onRefresh={refetchInstances}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Onboarding"
        description="Manage employee onboarding checklists"
      />

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors',
                selected
                  ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
              )
            }
          >
            Active Onboardings
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors',
                selected
                  ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
              )
            }
          >
            Templates
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* Instances Panel */}
          <Tab.Panel>
            {isManager() && (
              <div className="mb-4">
                <Button onClick={() => setShowInstanceModal(true)}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Start Onboarding
                </Button>
              </div>
            )}

            {loadingInstances ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : !instancesData?.instances?.length ? (
              <EmptyState
                title="No active onboardings"
                description={isManager() ? "Start a new onboarding process for a new employee." : "You have no onboarding tasks assigned."}
                action={isManager() ? () => setShowInstanceModal(true) : null}
                actionLabel="Start Onboarding"
              />
            ) : (
              <div className="card overflow-hidden">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Employee</TableHeader>
                      <TableHeader>Template</TableHeader>
                      <TableHeader>Progress</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Start Date</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {instancesData.instances.map((instance) => (
                      <TableRow
                        key={instance._id}
                        onClick={() => setSelectedInstance(instance)}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <TableCell className="font-medium">{instance.employee?.name}</TableCell>
                        <TableCell>{instance.template?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                              <div
                                className="h-2 bg-primary-600 rounded-full"
                                style={{ width: `${instance.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{instance.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={instance.status} /></TableCell>
                        <TableCell>
                          {new Date(instance.startDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Tab.Panel>

          {/* Templates Panel */}
          <Tab.Panel>
            {isAdmin() && (
              <div className="mb-4">
                <Button onClick={() => { setEditingTemplate(null); setShowTemplateModal(true); }}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Template
                </Button>
              </div>
            )}

            {loadingTemplates ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : !templatesData?.templates?.length ? (
              <EmptyState
                title="No templates"
                description="Create onboarding templates to streamline the process."
                action={isAdmin() ? () => setShowTemplateModal(true) : null}
                actionLabel="Create Template"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templatesData.templates.map((template) => (
                  <Card key={template._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{template.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{template.department}</p>
                        </div>
                        <StatusBadge status={template.isActive ? 'active' : 'retired'} />
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {template.tasks?.length || 0} tasks
                      </p>
                      {isAdmin() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleEditTemplate(template)}
                        >
                          Edit Template
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Modals */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => { setShowTemplateModal(false); setEditingTemplate(null); refetchTemplates(); }}
        template={editingTemplate}
      />

      <InstanceModal
        isOpen={showInstanceModal}
        onClose={() => { setShowInstanceModal(false); refetchInstances(); }}
        templates={templatesData?.templates || []}
      />
    </div>
  );
}
