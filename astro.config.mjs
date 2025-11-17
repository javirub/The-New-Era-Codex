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
                  items: [
                      {
                          label: 'Getting Started',
                          translations: {
                              es: 'Comenzar',
                          },
                          items: [
                              { slug: 'developers/index' },
                              { slug: 'developers/prompt-engineering-developers' },
                              { slug: 'developers/prompt-versioning-management' },
                          ]
                      },
                      {
                          label: 'RAG Systems',
                          translations: {
                              es: 'Sistemas RAG',
                          },
                          badge: { text: 'Popular', variant: 'tip' },
                          collapsed: false,
                          autogenerate: { directory: 'developers/rag-systems' },
                      },
                      {
                          label: 'AI Agents',
                          translations: {
                              es: 'Agentes de IA',
                          },
                          collapsed: true,
                          autogenerate: { directory: 'developers/ai-agents' },
                      },
                      {
                          label: 'LLM Operations',
                          translations: {
                              es: 'Operaciones LLM',
                          },
                          collapsed: true,
                          items: [
                              { slug: 'developers/llm-operations' },
                              { slug: 'developers/cost-optimization-llms' },
                              { slug: 'developers/llm-security-best-practices' },
                              { slug: 'developers/llm-testing-ci' },
                              { slug: 'developers/llm-evaluation-metrics' },
                              { slug: 'developers/llm-model-optimization' },
                              { slug: 'developers/llm-streaming-apis' },
                          ]
                      },
                      {
                          label: 'Frameworks',
                          translations: {
                              es: 'Frameworks',
                          },
                          collapsed: true,
                          items: [
                              { slug: 'developers/langchain-advanced' },
                          ]
                      },
                      {
                          label: 'Deployment',
                          translations: {
                              es: 'Despliegue',
                          },
                          collapsed: true,
                          items: [
                              { slug: 'developers/custom-llm-deployment' },
                              { slug: 'developers/fine-tuning-llms' },
                              { slug: 'developers/llm-edge-deployment' },
                          ]
                      },
                      {
                          label: 'Advanced Topics',
                          translations: {
                              es: 'Temas Avanzados',
                          },
                          collapsed: true,
                          items: [
                              { slug: 'developers/multimodal-ai-apps' },
                          ]
                      },
                      {
                          label: 'Reference',
                          translations: {
                              es: 'Referencia',
                          },
                          collapsed: true,
                          autogenerate: { directory: 'developers/reference' },
                      },
                  ],
              },
              {
                  label: 'For Automation',
                  translations: {
                      es: 'Para Automatización',
                  },
                  badge: { text: 'No-Code', variant: 'tip' },
                  items: [
                      { slug: 'automation/index' },
                      {
                          label: 'Getting Started',
                          translations: {
                              es: 'Comenzar',
                          },
                          badge: { text: 'Start Here', variant: 'tip' },
                          collapsed: false,
                          autogenerate: { directory: 'automation/getting-started' },
                      },
                      {
                          label: 'Chatbots & Assistants',
                          translations: {
                              es: 'Chatbots y Asistentes',
                          },
                          collapsed: true,
                          autogenerate: { directory: 'automation/chatbots-assistants' },
                      },
                      {
                          label: 'Business Automation',
                          translations: {
                              es: 'Automatización de Negocios',
                          },
                          collapsed: true,
                          autogenerate: { directory: 'automation/business-automation' },
                      },
                      {
                          label: 'Document & Data',
                          translations: {
                              es: 'Documentos y Datos',
                          },
                          collapsed: true,
                          autogenerate: { directory: 'automation/document-data' },
                      },
                      {
                          label: 'Content & Social',
                          translations: {
                              es: 'Contenido y Redes Sociales',
                          },
                          collapsed: true,
                          autogenerate: { directory: 'automation/content-social' },
                      },
                      {
                          label: 'Resources',
                          translations: {
                              es: 'Recursos',
                          },
                          collapsed: true,
                          autogenerate: { directory: 'automation/resources' },
                      },
                  ],
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