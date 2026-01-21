import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  CubeIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { assetsAPI, onboardingAPI, vendorsAPI } from '../services/api';
import { Card, CardContent, Spinner } from '../components/ui';

function StatCard({ title, value, icon: Icon, href, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  };

  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

function AlertCard({ title, message, href }) {
  return (
    <Link to={href}>
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
        <CardContent className="p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { user, isManager, isAdmin } = useAuth();

  const { data: assetStats, isLoading: loadingAssets } = useQuery({
    queryKey: ['asset-stats'],
    queryFn: () => assetsAPI.getStats().then(res => res.data),
    enabled: isManager(),
  });

  const { data: onboardingStats, isLoading: loadingOnboarding } = useQuery({
    queryKey: ['onboarding-stats'],
    queryFn: () => onboardingAPI.getStats().then(res => res.data),
    enabled: isManager(),
  });

  const { data: vendorStats, isLoading: loadingVendors } = useQuery({
    queryKey: ['vendor-stats'],
    queryFn: () => vendorsAPI.getStats().then(res => res.data),
    enabled: isAdmin(),
  });

  const isLoading = loadingAssets || loadingOnboarding || loadingVendors;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening in your organization
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isManager() && (
              <>
                <StatCard
                  title="Total Assets"
                  value={assetStats?.total || 0}
                  icon={CubeIcon}
                  href="/assets"
                  color="primary"
                />
                <StatCard
                  title="Active Onboardings"
                  value={onboardingStats?.active || 0}
                  icon={ClipboardDocumentListIcon}
                  href="/onboarding"
                  color="blue"
                />
              </>
            )}
            {isAdmin() && (
              <>
                <StatCard
                  title="Active Vendors"
                  value={vendorStats?.active || 0}
                  icon={BuildingStorefrontIcon}
                  href="/vendors"
                  color="green"
                />
                <StatCard
                  title="Asset Value"
                  value={`$${((assetStats?.totalValue || 0) / 1000).toFixed(0)}k`}
                  icon={CubeIcon}
                  href="/assets"
                  color="yellow"
                />
              </>
            )}
          </div>

          {/* Alerts Section */}
          {isManager() && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Attention Required</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assetStats?.warrantyExpiringSoon > 0 && (
                  <AlertCard
                    title={`${assetStats.warrantyExpiringSoon} warranties expiring`}
                    message="Review assets with warranties expiring in the next 30 days"
                    href="/assets"
                  />
                )}
                {assetStats?.maintenanceDue > 0 && (
                  <AlertCard
                    title={`${assetStats.maintenanceDue} assets in maintenance`}
                    message="Assets currently under maintenance"
                    href="/assets"
                  />
                )}
                {onboardingStats?.overdueTasks > 0 && (
                  <AlertCard
                    title={`${onboardingStats.overdueTasks} overdue tasks`}
                    message="Onboarding tasks that need attention"
                    href="/onboarding"
                  />
                )}
                {onboardingStats?.tasksDueSoon > 0 && (
                  <AlertCard
                    title={`${onboardingStats.tasksDueSoon} tasks due soon`}
                    message="Onboarding tasks due in the next 7 days"
                    href="/onboarding"
                  />
                )}
                {isAdmin() && vendorStats?.contractsExpiringSoon > 0 && (
                  <AlertCard
                    title={`${vendorStats.contractsExpiringSoon} contracts expiring`}
                    message="Vendor contracts expiring in the next 30 days"
                    href="/vendors"
                  />
                )}
              </div>
            </div>
          )}

          {/* Quick Stats for Managers */}
          {isManager() && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Asset Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {assetStats?.byStatus?.map((stat) => (
                  <Card key={stat._id}>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.count}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{stat._id}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Employee View */}
          {user?.role === 'employee' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Assigned Assets</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    View and manage assets assigned to you.
                  </p>
                  <Link
                    to="/assets"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium mt-4 block"
                  >
                    View Assets →
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Onboarding Tasks</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Complete your assigned onboarding tasks.
                  </p>
                  <Link
                    to="/onboarding"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium mt-4 block"
                  >
                    View Tasks →
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
