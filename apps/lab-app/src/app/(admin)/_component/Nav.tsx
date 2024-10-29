'use client';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  PencilIcon, DocumentDuplicateIcon, UserIcon, CogIcon,
} from '@heroicons/react/24/solid';
import { MenuButton, MenuItems, MenuItem, DisclosureButton, DisclosurePanel

 } from '@headlessui/react';    
import Image from 'next/image';
import Tiadmed from "../../../../public/tiamed.png";
import clsx from 'clsx';

const Nav = [
  { name: 'Pharma', href: '#', current: true },
  { name: 'Ward Indents', href: '#', current: false },
  { name: 'Statics', href: '#', current: false },
  {
    name: 'Settings',
    current: false,
    children: [
      { name: 'Profile', href: '#', icon: UserIcon },
      { name: 'Account', href: '#', icon: CogIcon },
    ],
  },
  {
    name: 'Bills',
    current: false,
    children: [
      { name: 'Create Bill', href: '#', icon: PencilIcon },
      { name: 'View Bills', href: '#', icon: DocumentDuplicateIcon },
      { name: 'Edit Bills', href: '#', icon: PencilIcon },
    ],
  },
];

const TopNav = () => {
  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-full px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 justify-between">
              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>

              {/* Logo */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  <Image src={Tiadmed} alt="Tiadmed" width={100} height={100} />
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {/* Loop through Nav array */}
                  {Nav.map((item) =>
                    item.children ? (
                      <Menu as="div" className="relative inline-block text-left mt-5" key={item.name}>
                        <MenuButton className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-zinc-900 hover:border-purple-500 hover:text-purple-600 text-sm">
                          {item.name}
                          <ChevronDownIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                        </MenuButton>
                        <MenuItems className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {item.children.map((subItem) => (
                            <MenuItem key={subItem.name}>
                              {({ active }) => (
                                <a
                                  href={subItem.href}
                                  className={clsx(
                                    active ? 'bg-gray-100' : '',
                                    'flex items-center px-4 py-2 text-sm text-zinc-900 hover:bg-gray-100 hover:text-purple-600'
                                  )}
                                >
                                  <subItem.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" 
                                  />
                                  {subItem.name}
                                </a>
                              )}
                            </MenuItem>
                          ))}
                        </MenuItems>
                      </Menu>
                    ) : (
                      <a
                        key={item.name}
                        href={item.href}
                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-zinc-900 hover:border-purple-500 hover:text-purple-600"
                      >
                        {item.name}
                      </a>
                    )
                  )}
                </div>
              </div>

              {/* Right section (profile and notifications) */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                  type="button"
                  className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                      
                    </MenuButton>
                  </div>
                  <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href="#"
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-zinc-900 hover:bg-gray-100 hover:text-purple-600'
                          )}
                        >
                          Your Profile
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href="#"
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-zinc-900 hover:bg-gray-100 hover:text-purple-600'
                          )}
                        >
                          Settings
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href="#"
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-zinc-900 hover:bg-gray-100 hover:text-purple-600'
                          )}
                        >
                          Sign out
                        </a>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 pb-4 pt-2">
              {Nav.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-zinc-900 hover:border-purple-500 hover:bg-gray-50 hover:text-purple-600"
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

export default TopNav;

