// frontend/src/router/documentType.routes.js

export const documentTypeRoutes = [
  {
    path: '/admin/document-types',
    component: () => import('@/pages/admin/DocumentTypeAdminPage.vue'),
    meta: {
      title: 'Tipos de Documento',
      requiresAuth: true,
      requiresRole: ['ADMIN'],
    },
  },
];

export default documentTypeRoutes;
