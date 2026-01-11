import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>autoHODL Docs</span>,
  primaryHue: { light: 110, dark: 110 }, // use autoHODL green for links
  primarySaturation: { light: 80, dark: 80 },
  project: {
    link: 'https://github.com/locker/autohodl.money',
  },
  chat: {
    link: 'https://t.me/+713AuddkI9phNjUx',
  },
  docsRepositoryBase: 'https://github.com/locker/autohodl.money/tree/main/apps/docs',
  footer: {
    text: 'autoHODL Documentation',
  },
}

export default config

