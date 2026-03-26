import type { AppInfo } from './AppLauncher';

/** All known Flowcore web applications and their production URLs. */
export const FLOWCORE_APPS: AppInfo[] = [
  {
    slug: 'ops',
    display_name: 'Ops Console',
    url: 'https://ops.flowcorewater.com',
  },
  {
    slug: 'analytics',
    display_name: 'Analytics',
    url: 'https://analytics.flowcorewater.com',
  },
  {
    slug: 'training',
    display_name: 'Training',
    url: 'https://training.flowcorewater.com',
  },
  {
    slug: 'wellscope',
    display_name: 'WellScope',
    url: 'https://wellscope.flowcorewater.com',
  },
  {
    slug: 'parts',
    display_name: 'Parts Request',
    url: 'https://parts.flowcorewater.com',
  },
  {
    slug: 'mail',
    display_name: 'Direct Mail',
    url: 'https://mail.flowcorewater.com',
  },
];
