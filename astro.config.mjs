// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://codex.javirub.pro',
  integrations: [
      starlight({
          title: 'The New Era Codex',
          description: 'Democratizing AI knowledge across all professions',
          defaultLocale: 'root',
          locales: {
              root: {
                  label: 'English',
                  lang: 'en',
              },
              es: {
                  label: 'Español',
                  lang: 'es',
              },
          },
          social: [
              { icon: 'github', label: 'GitHub', href: 'https://github.com/javirub/The-New-Era-Codex' },
          ],
          editLink: {
              baseUrl: 'https://github.com/javirub/The-New-Era-Codex/edit/main/',
          },
          sidebar: [
              {
                  label: 'For Developers',
                  badge: { text: 'Code', variant: 'note' },
                  autogenerate: { directory: 'developers' },
              },
              {
                  label: 'For Automation',
                  badge: { text: 'No-Code', variant: 'tip' },
                  autogenerate: { directory: 'automation' },
              },
              {
                  label: 'For Everyone',
                  badge: { text: 'Beginner', variant: 'success' },
                  autogenerate: { directory: 'everyone' },
              },
              {
                  label: 'For Professionals',
                  badge: { text: 'Business', variant: 'caution' },
                  autogenerate: { directory: 'professionals' },
              },
              {
                  label: 'Community',
                  items: [
                      { label: 'Contribution Guide', slug: 'community/contributing' },
                      { label: 'Style Guide', slug: 'community/style-guide' },
                      {
                          label: 'Content Templates',
                          collapsed: true,
                          items: [
                              { label: 'Developer Guide Template', slug: 'community/templates/developer-guide-template' },
                              { label: 'Automation Guide Template', slug: 'community/templates/automation-guide-template' },
                              { label: 'Everyone Guide Template', slug: 'community/templates/everyone-guide-template' },
                              { label: 'Professional Guide Template', slug: 'community/templates/professional-guide-template' },
                          ],
                      },
                  ],
              },
          ],
      }),
      sitemap(),
	],

  vite: {
    plugins: [tailwindcss()],
  },
});