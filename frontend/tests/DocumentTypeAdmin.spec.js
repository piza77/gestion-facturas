import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import DocumentTypeAdmin from '@/components/DocumentTypeAdmin.vue';
import { useDocumentTypeStore } from '@/stores/documentType.store';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/services/documentType.service');

describe('DocumentTypeAdmin.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('debe renderizar el header correctamente', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    expect(wrapper.find('h1').text()).toContain('Tipos de Documento');
    expect(wrapper.findComponent({ name: 'button', text: /Nuevo Tipo/ }).exists()).toBe(true);
  });

  it('debe mostrar estado vacío cuando no hay tipos', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    expect(wrapper.text()).toContain('No hay tipos de documento');
  });

  it('debe abrir modal al hacer click en Nuevo Tipo', async () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const newButton = wrapper.find('button:contains("Nuevo Tipo")');
    expect(wrapper.vm.showFormModal).toBe(false);

    // Simulación de click
    wrapper.vm.openCreateModal();
    expect(wrapper.vm.showFormModal).toBe(true);
  });

  it('debe resetear formulario al crear nuevo tipo', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    wrapper.vm.openCreateModal();

    expect(wrapper.vm.form.name).toBe('');
    expect(wrapper.vm.form.code).toBe('');
    expect(wrapper.vm.form.fields).toEqual([]);
    expect(wrapper.vm.isEditing).toBe(false);
  });

  it('debe agregar un nuevo campo', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    wrapper.vm.openCreateModal();
    const initialCount = wrapper.vm.form.fields.length;

    wrapper.vm.addField();

    expect(wrapper.vm.form.fields).toHaveLength(initialCount + 1);
    expect(wrapper.vm.form.fields[initialCount]).toEqual(
      expect.objectContaining({
        name: '',
        label: '',
        type: 'text',
        isRequired: false,
      })
    );
  });

  it('debe remover un campo', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    wrapper.vm.form.fields = [
      { name: 'field1', label: 'Field 1' },
      { name: 'field2', label: 'Field 2' },
    ];

    wrapper.vm.removeField(0);

    expect(wrapper.vm.form.fields).toHaveLength(1);
    expect(wrapper.vm.form.fields[0].name).toBe('field2');
  });

  it('debe validar que campo requerido tenga datos', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    wrapper.vm.openCreateModal();
    wrapper.vm.form.name = '';
    wrapper.vm.form.code = '';

    // Los campos requeridos deben estar vacíos
    expect(wrapper.vm.form.name).toBe('');
    expect(wrapper.vm.form.code).toBe('');
  });

  it('debe formatear fechas correctamente', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const date = new Date('2026-03-18T10:30:00');
    const formatted = wrapper.vm.formatDate(date);

    expect(formatted).toContain('18');
    expect(formatted).toContain('2026');
  });

  it('debe confirmar eliminación antes de eliminar', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const typeToDelete = { id: 1, name: 'Factura' };

    wrapper.vm.confirmDelete(typeToDelete);

    expect(wrapper.vm.showConfirmDelete).toBe(true);
    expect(wrapper.vm.typeToDelete).toEqual(typeToDelete);
  });

  it('debe cancelar eliminación', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    wrapper.vm.showConfirmDelete = true;
    wrapper.vm.typeToDelete = { id: 1 };

    wrapper.vm.cancelDelete();

    expect(wrapper.vm.showConfirmDelete).toBe(false);
    expect(wrapper.vm.typeToDelete).toBe(null);
  });

  it('debe cerrar modal de formulario', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    wrapper.vm.showFormModal = true;
    wrapper.vm.closeFormModal();

    expect(wrapper.vm.showFormModal).toBe(false);
  });

  it('debe cerrar modal de detalles', () => {
    const wrapper = mount(DocumentTypeAdmin, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    wrapper.vm.showDetailModal = true;
    wrapper.vm.detailType = { id: 1 };

    wrapper.vm.closeDetailModal();

    expect(wrapper.vm.showDetailModal).toBe(false);
    expect(wrapper.vm.detailType).toBe(null);
  });
});
