// 'use client';
// import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
// import { Bars3Icon, BellIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
// import { CogIcon, DocumentDuplicateIcon, PencilIcon, UserIcon } from '@heroicons/react/24/solid';
// import { ClipboardIcon, ChartBarIcon, WrenchIcon } from '@heroicons/react/24/solid';
// import clsx from 'clsx';
// import Image from 'next/image';
// import Tiadmed from "../../../../public/tiamed.png";
// import { Settings, UserMinus } from 'lucide-react';

// const Nav = [
//   { name: 'Pharma', href: '#', current: true, icon: ClipboardIcon },
//   { name: 'Ward Indents', href: '#', current: false, icon: WrenchIcon },
//   { name: 'Statics', href: '#', current: false, icon: ChartBarIcon },
//   {
//     name: 'Settings',
//     current: false,
//     icon: CogIcon,
//     children: [
//       { name: 'Profile', href: '#', icon: UserIcon },
//       { name: 'Account', href: '#', icon: CogIcon },
//     ],
//   },
//   {
//     name: 'Bills',
//     current: false,
//     icon: DocumentDuplicateIcon,
//     children: [
//       { name: 'Create Bill', href: '#', icon: PencilIcon },
//       { name: 'View Bills', href: '#', icon: DocumentDuplicateIcon },
//       { name: 'Edit Bills', href: '#', icon: PencilIcon },
//     ],
//   },
// ];

// const TopNav = () => {
//   return (
//     <Disclosure as="nav" className="bg-purple-950 shadow">
//       {({ open }) => (
//         <>
//           <div className="mx-auto max-w-full px-2 sm:px-6 lg:px-8">
//             <div className="relative flex h-16 items-center justify-between">
//               {/* Mobile menu button */}
//               <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
//                 <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500">
//                   <span className="sr-only">Open main menu</span>
//                   {open ? (
//                     <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
//                   ) : (
//                     <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
//                   )}
//                 </DisclosureButton>
//               </div>

//               {/* Logo */}
//               <div className="flex flex-1 items-center justify-between sm:items-stretch sm:justify-start">
//                 <div className="flex-shrink-0 flex items-center">
//                   <Image src={Tiadmed} alt="Tiadmed" width={40} height={40} className="h-auto w-auto" />
//                 </div>
//                 <div className="hidden sm:ml-6 sm:flex sm:space-x-8 mt-0 items-center">
//                   {/* Loop through Nav array */}
//                   {Nav.map((item) =>
//                     item.children ? (
//                       <Menu as="div" className="relative inline-block text-left" key={item.name}>
//                         <MenuButton className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-white hover:border-purple-300 hover:text-purple-300">
//                           <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
//                           {item.name}
//                           <ChevronDownIcon className="ml-2 h-5 w-5" aria-hidden="true" />
//                         </MenuButton>
//                         <MenuItems className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//                           {item.children.map((subItem) => (
//                             <MenuItem key={subItem.name}>
//                               {({ active }) => (
//                                 <a
//                                   href={subItem.href}
//                                   className={clsx(
//                                     active ? 'bg-gray-100' : '',
//                                     'flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-purple-100 hover:text-purple-700'
//                                   )}
//                                 >
//                                   <subItem.icon className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
//                                   {subItem.name}
//                                 </a>
//                               )}
//                             </MenuItem>
//                           ))}
//                         </MenuItems>
//                       </Menu>
//                     ) : (
//                       <a
//                         key={item.name}
//                         href={item.href}
//                         className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-white hover:border-purple-300 hover:text-purple-300"
//                       >
//                         <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
//                         {item.name}
//                       </a>
//                     )
//                   )}
//                 </div>
//               </div>

//               {/* Right section (profile and notifications) */}
//               <div className="flex items-center space-x-4">
//                 <button
//                   type="button"
//                   className="relative rounded-full bg-purple-900 p-1 text-white hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
//                 >
//                   <span className="sr-only">View notifications</span>
//                   <BellIcon className="h-6 w-6" aria-hidden="true" />
//                 </button>

//                 {/* Profile dropdown */}
//                 <Menu as="div" className="relative">
//                   <div>
//                     <MenuButton className="flex rounded-full bg-purple-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
//                       <span className="sr-only">Open user menu</span>
//                       <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white">
//                         <span className="text-sm font-medium text-purple-900">A</span>
//                       </span>
//                     </MenuButton>
//                   </div>
//                   <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//                     <MenuItem>
//                       {({ active }) => (
//                         <a
//                           href="#"
//                           className={clsx(
//                             active ? 'bg-gray-100' : '',
//                             'block flex px-4 py-2 text-sm text-gray-900 hover:bg-purple-100 hover:text-purple-700'
//                           )}
//                         >
//                           <UserIcon className="mr-3 h-5 w-4 text-gray-400" aria-hidden="true" />
//                           Your Profile
//                         </a>
//                       )}
//                     </MenuItem>
//                     <MenuItem>
//                       {({ active }) => (
//                         <a
//                           href="#"
//                           className={clsx(
//                             active ? 'bg-gray-100' : '',
//                             'block flex px-4 py-2 text-sm text-gray-900 hover:bg-purple-100 hover:text-purple-700'
//                           )}
//                         >
//                           <Settings className="mr-3 h-5 w-4 text-gray-400" aria-hidden="true" />
//                           Settings
//                         </a>
//                       )}
//                     </MenuItem>
//                     <MenuItem>
//                       {({ active }) => (
//                         <a
//                           href="#"
//                           className={clsx(
//                             active ? 'bg-gray-100 ' : '',
//                             'block flex px-4 py-2 text-sm text-gray-900 hover:bg-purple-100 hover:text-purple-700'
//                           )}
//                         >
//                           <UserMinus className="mr-3 h-5 w-4 text-gray-400" aria-hidden="true" />   
//                           Sign out
//                         </a>
//                       )}
//                     </MenuItem>
//                   </MenuItems>
//                 </Menu>
//               </div>
//             </div>
//           </div>

//           {/* Mobile menu */}
//           <DisclosurePanel className="sm:hidden">
//             <div className="space-y-1 pb-4 pt-2">
//               {Nav.map((item) => (
//                 <DisclosureButton
//                   key={item.name}
//                   as="a"
//                   href={item.href}
//                   className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-white hover:border-purple-300 hover:bg-purple-700"
//                 >
//                   <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
//                   {item.name}
//                 </DisclosureButton>
//               ))}
//             </div>
//           </DisclosurePanel>
//         </>
//       )}
//     </Disclosure>
//   );
// };

// export default TopNav;











'use client';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, BellIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CogIcon, DocumentDuplicateIcon, PencilIcon, UserIcon } from '@heroicons/react/24/solid';
import { ClipboardIcon, ChartBarIcon, WrenchIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Image from 'next/image';
import Tiadmed from "../../../../public/tiamed.png";
import { Settings, UserMinus } from 'lucide-react';

const Nav = [
  { name: 'Pharma', href: '#', current: true, icon: ClipboardIcon },
  { name: 'Ward Indents', href: '#', current: false, icon: WrenchIcon },
  { name: 'Statics', href: '#', current: false, icon: ChartBarIcon },
  {
    name: 'Settings',
    current: false,
    icon: CogIcon,
    children: [
      { name: 'Profile', href: '#', icon: UserIcon },
      { name: 'Account', href: '#', icon: CogIcon },
    ],
  },
  {
    name: 'Bills',
    current: false,
    icon: DocumentDuplicateIcon,
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
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>

              {/* Logo */}
              <div className="flex flex-1 items-center justify-between sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  <Image src={Tiadmed} alt="Tiadmed" width={40} height={40} className="h-auto w-auto" />
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8 mt-0 items-center">
                  {/* Loop through Nav array */}
                  {Nav.map((item) =>
                    item.children ? (
                      <Menu as="div" className="relative inline-block text-left" key={item.name}>
                        <MenuButton className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-700 hover:text-purple-500 hover:border-purple-500">
                          <item.icon className="mr-2 h-5 w-5 text-gray-500 group-hover:text-purple-500" aria-hidden="true" />
                          {item.name}
                          <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-500 group-hover:text-purple-500" aria-hidden="true" />
                        </MenuButton>
                        <MenuItems className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {item.children.map((subItem) => (
                            <MenuItem key={subItem.name}>
                              {({ active }) => (
                                <a
                                  href={subItem.href}
                                  className={clsx(
                                    active ? 'bg-purple-100' : '',
                                    'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-500'
                                  )}
                                >
                                  <subItem.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-purple-500" aria-hidden="true" />
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
                        className="group inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-700 hover:text-purple-500 hover:border-purple-500"
                      >
                        <item.icon className="mr-2 h-5 w-5 text-gray-500 group-hover:text-purple-500" aria-hidden="true" />
                        {item.name}
                      </a>
                    )
                  )}
                </div>
              </div>

              {/* Right section (profile and notifications) */}
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className="relative rounded-full bg-white p-1 text-gray-500 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6 group-hover:text-purple-500" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <div>
                    <MenuButton className="flex rounded-full bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white">
                        <span className="text-sm font-medium text-purple-900">A</span>
                      </span>
                    </MenuButton>
                  </div>
                  <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href="#"
                          className={clsx(
                            active ? 'bg-purple-100' : '',
                            'block flex px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-500'
                          )}
                        >
                          <UserIcon className="mr-3 h-5 w-4 text-gray-400 group-hover:text-purple-500" aria-hidden="true" />
                          Your Profile
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href="#"
                          className={clsx(
                            active ? 'bg-purple-100' : '',
                            'block flex px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-500'
                          )}
                        >
                          <Settings className="mr-3 h-5 w-4 text-gray-400 group-hover:text-purple-500" aria-hidden="true" />
                          Settings
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href="#"
                          className={clsx(
                            active ? 'bg-purple-100 ' : '',
                            'block flex px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-500'
                          )}
                        >
                          <UserMinus className="mr-3 h-5 w-4 text-gray-400 group-hover:text-purple-500" aria-hidden="true" />   
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
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-700 hover:text-purple-500 hover:bg-purple-100"
                >
                  <item.icon className="mr-2 h-5 w-5 group-hover:text-purple-500" aria-hidden="true" />
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
