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
                  translations: {
                      es: 'Para Desarrolladores',
                  },
                  badge: { text: 'Code', variant: 'note' },
                  autogenerate: { directory: 'developers' },
              },
              {
                  label: 'For Automation',
                  translations: {
                      es: 'Para Automatización',
                  },
                  badge: { text: 'No-Code', variant: 'tip' },
                  autogenerate: { directory: 'automation' },
              },
              {
                  label: 'For Everyone',
                  translations: {
                      es: 'Para Todos',
                  },
                  badge: { text: 'Beginner', variant: 'success' },
                  autogenerate: { directory: 'everyone' },
              },
              {
                  label: 'For Professionals',
                  translations: {
                      es: 'Para Profesionales',
                  },
                  badge: { text: 'Business', variant: 'caution' },
                  autogenerate: { directory: 'professionals' },
              },
              {
                  label: 'Community',
                  translations: {
                      es: 'Comunidad',
                  },
                  items: [
                      {
                          label: 'Contribution Guide',
                          translations: {
                              es: 'Guía de Contribución',
                          },
                          slug: 'community/contributing',
                      },
                      {
                          label: 'Style Guide',
                          translations: {
                              es: 'Guía de Estilo',
                          },
                          slug: 'community/style-guide',
                      },
                      {
                          label: 'Content Templates',
                          translations: {
                              es: 'Plantillas de Contenido',
                          },
                          collapsed: true,
                          items: [
                              {
                                  label: 'Developer Guide Template',
                                  translations: {
                                      es: 'Plantilla Guía Desarrollador',
                                  },
                                  slug: 'community/templates/developer-guide-template',
                              },
                              {
                                  label: 'Automation Guide Template',
                                  translations: {
                                      es: 'Plantilla Guía Automatización',
                                  },
                                  slug: 'community/templates/automation-guide-template',
                              },
                              {
                                  label: 'Everyone Guide Template',
                                  translations: {
                                      es: 'Plantilla Guía Para Todos',
                                  },
                                  slug: 'community/templates/everyone-guide-template',
                              },
                              {
                                  label: 'Professional Guide Template',
                                  translations: {
                                      es: 'Plantilla Guía Profesional',
                                  },
                                  slug: 'community/templates/professional-guide-template',
                              },
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