import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['admin', 'manager', 'employee'] },
  { name: 'Assets', href: '/assets', icon: CubeIcon, roles: ['admin', 'manager', 'employee'] },
  { name: 'Onboarding', href: '/onboarding', icon: ClipboardDocumentListIcon, roles: ['admin', 'manager', 'employee'] },
  { name: 'Vendors', href: '/vendors', icon: BuildingStorefrontIcon, roles: ['admin', 'manager'] },
  { name: 'Users', href: '/users', icon: UsersIcon, roles: ['admin'] },
];

function NavItem({ item, onClick, collapsed }) {
  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) =>
        `group flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`
      }
    >
      <item.icon className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
      {!collapsed && <span className="truncate">{item.name}</span>}
    </NavLink>
  );
}

function SidebarContent({ onClose, collapsed, onToggle, isMobile = false }) {
  const { user } = useAuth();

  const filteredNav = navigation.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold text-primary-600">OpsHub</span>
          <button
            type="button"
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            onClick={isMobile ? onClose : undefined}
            collapsed={collapsed && !isMobile}
          />
        ))}
      </nav>

      {/* Footer with department info */}
      <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${collapsed && !isMobile ? 'flex justify-center' : ''}`}>
        {collapsed && !isMobile ? (
          <div title={user?.department || 'No Department'}>
            <UserGroupIcon className="h-5 w-5 text-gray-400" />
          </div>
        ) : (
          <div className="flex items-center">
            <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.department || 'No Department'}
            </span>
          </div>
        )}
      </div>

      {/* Collapse toggle button - desktop only */}
      {!isMobile && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onToggle}
            className={`flex items-center ${collapsed ? 'justify-center w-full' : 'justify-between w-full'} px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            {!collapsed && <span>Collapse</span>}
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ open, onClose, collapsed, onToggle }) {
  return (
    <>
      {/* Mobile sidebar */}
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full">
                <SidebarContent onClose={onClose} collapsed={false} isMobile={true} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div
          className={`flex flex-col ${collapsed ? 'w-20' : 'w-64'} border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out`}
        >
          <SidebarContent
            onClose={() => {}}
            collapsed={collapsed}
            onToggle={onToggle}
            isMobile={false}
          />
        </div>
      </div>
    </>
  );
}
