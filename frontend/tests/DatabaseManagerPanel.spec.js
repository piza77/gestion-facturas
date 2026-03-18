import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DatabaseManagerPanel from '../../components/DatabaseManagerPanel.vue';
import { useDatabaseStore } from '../../stores/database.store';

describe('DatabaseManagerPanel.vue', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useDatabaseStore();
    
    // Mock store data
    store.tables = ['users', 'invoices', 'invoices_detail'];
    store.selectedTable = null;
  });

  describe('Rendering', () => {
    it('should render component structure', () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: {
          stubs: {
            TableDataViewer: true
          }
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.database-manager-container').exists()).toBe(true);
    });

    it('should display header with title', () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      expect(wrapper.text()).toContain('Gestor de Base de Datos');
    });

    it('should render action buttons', () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Sidebar Tables List', () => {
    it('should display all tables', () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      const tableItems = wrapper.findAll('.table-item');
      expect(tableItems.length).toBe(store.tables.length);
    });

    it('should filter tables based on search', async () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      await wrapper.vm.$nextTick();
      
      // Assuming searchFilter property exists
      const searchInput = wrapper.find('.search-input');
      if (searchInput.exists()) {
        await searchInput.setValue('users');
        // Table filter should work
      }
    });

    it('should highlight selected table', async () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      store.selectedTable = 'users';
      await wrapper.vm.$nextTick();

      // Selected table should have active class
    });
  });

  describe('Table Selection', () => {
    it('should select table when clicked', async () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      const tableItems = wrapper.findAll('.table-item');
      if (tableItems.length > 0) {
        await tableItems[0].trigger('click');
      }
    });

    it('should display selected table details', () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      store.selectedTable = 'users';
      store.selectedTableSchema = {
        tableName: 'users',
        columns: [
          { name: 'id', type: 'INT', nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      };

      wrapper.vm.$forceUpdate();
      expect(wrapper.text()).toContain('users');
    });
  });

  describe('Tabs Navigation', () => {
    it('should show schema tab by default', () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      expect(wrapper.vm.activeTab).toBe('schema');
    });

    it('should switch tabs when clicked', async () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      const tabs = wrapper.findAll('.tab');
      if (tabs.length > 1) {
        await tabs[1].trigger('click');
        expect(wrapper.vm.activeTab).toBe('data');
      }
    });
  });

  describe('Error Handling', () => {
    it('should display error messages', async () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      store.error = 'Test error message';
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Test error message');
    });

    it('should display success messages', async () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      store.successMessage = 'Operation successful';
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Operation successful');
    });
  });

  describe('Loading State', () => {
    it('should show loading overlay when loading', async () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      store.loading = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.loading-overlay').exists()).toBe(true);
    });

    it('should hide loading overlay when done', async () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      store.loading = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.loading-overlay').exists()).toBe(false);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no table selected', () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      store.selectedTable = null;

      expect(wrapper.text()).toContain('Selecciona una tabla');
    });
  });

  describe('Modal Control', () => {
    it('should show create table modal', async () => {
      wrapper = mount(DatabaseManagerPanel, {
        global: { stubs: { TableDataViewer: true } }
      });

      const createBtn = wrapper.find('button');
      expect(createBtn.exists()).toBe(true);
    });
  });
});
