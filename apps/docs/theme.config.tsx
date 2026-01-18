import React from 'react';
import type { DocsThemeConfig } from 'nextra-theme-docs';
import { TelegramSvg } from './components/TelegramSvg';

const config: DocsThemeConfig = {
  logo: <span>autoHODL Docs</span>,
  primaryHue: { light: 110, dark: 110 }, // use autoHODL green for links
  primarySaturation: { light: 80, dark: 80 },
  project: {
    link: 'https://github.com/locker-labs/autohodl.money',
  },
  chat: {
    link: 'https://t.me/+713AuddkI9phNjUx',
    icon: <TelegramSvg />,
  },
  docsRepositoryBase: 'https://github.com/locker-labs/autohodl.money/tree/main/apps/docs',
  footer: {
    text: 'autoHODL Documentation',
  },
};

export default config;
