export const databaseRoutes = [
  {
    path: '/admin/database',
    name: 'DatabaseManager',
    component: () => import('../components/DatabaseManagerPanel.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Gestor de Base de Datos'
    }
  },
  {
    path: '/admin/database/backup',
    name: 'BackupManager',
    component: () => import('../components/BackupManager.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Gestor de Backups'
    }
  },
  {
    path: '/admin/database/sql-editor',
    name: 'SqlEditor',
    component: () => import('../components/SqlEditor.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Editor SQL'
    }
  }
];

export default databaseRoutes;
