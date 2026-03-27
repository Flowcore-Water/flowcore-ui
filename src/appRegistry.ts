import type { AppInfo } from './AppLauncher';

/** All known Flowcore web applications and their production URLs. */
export const FLOWCORE_APPS: AppInfo[] = [
  {
    slug: 'ops-console',
    display_name: 'Ops Console',
    url: 'https://ops.flowcorewater.com',
  },
  {
    slug: 'admin',
    display_name: 'Admin',
    url: 'https://flowcore-identity.web.app',
  },
  {
    slug: 'training-tracker',
    display_name: 'Training',
    url: 'https://training.flowcorewater.com',
  },
  {
    slug: 'wellscope',
    display_name: 'WellScope',
    url: 'https://wellscope.flowcorewater.com',
  },
  {
    slug: 'mirror',
    display_name: 'ST Mirror',
    url: 'https://data.flowcorewater.com',
  },
];
