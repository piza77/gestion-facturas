import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import documentTypeService from '@/services/documentType.service';

export const useDocumentTypeStore = defineStore('documentType', () => {
  const documentTypes = ref([]);
  const selectedType = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const activeTypes = computed(() => 
    documentTypes.value.filter(t => t.isActive)
  );

  const getTypeById = (id) => 
    documentTypes.value.find(t => t.id === id);

  const getTypeByCode = (code) => 
    documentTypes.value.find(t => t.code === code);

  // Actions
  const fetchAllTypes = async () => {
    loading.value = true;
    error.value = null;
    try {
      documentTypes.value = await documentTypeService.getAllTypes();
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching document types:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchTypeById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const type = await documentTypeService.getTypeById(id);
      selectedType.value = type;
      return type;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching document type:', err);
    } finally {
      loading.value = false;
    }
  };

  const createType = async (typeData) => {
    loading.value = true;
    error.value = null;
    try {
      const newType = await documentTypeService.createType(typeData);
      documentTypes.value.push(newType);
      return newType;
    } catch (err) {
      error.value = err.response?.data?.error || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateType = async (id, typeData) => {
    loading.value = true;
    error.value = null;
    try {
      const updated = await documentTypeService.updateType(id, typeData);
      const index = documentTypes.value.findIndex(t => t.id === id);
      if (index !== -1) {
        documentTypes.value[index] = updated;
      }
      if (selectedType.value?.id === id) {
        selectedType.value = updated;
      }
      return updated;
    } catch (err) {
      error.value = err.response?.data?.error || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteType = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await documentTypeService.deleteType(id);
      documentTypes.value = documentTypes.value.filter(t => t.id !== id);
      if (selectedType.value?.id === id) {
        selectedType.value = null;
      }
    } catch (err) {
      error.value = err.response?.data?.error || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getNextFolio = async (documentTypeId) => {
    try {
      return await documentTypeService.getNextFolio(documentTypeId);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const getStatistics = async (id) => {
    try {
      return await documentTypeService.getTypeStatistics(id);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const searchTypes = async (query) => {
    loading.value = true;
    error.value = null;
    try {
      return await documentTypeService.searchTypes(query);
    } catch (err) {
      error.value = err.message;
      console.error('Error searching types:', err);
    } finally {
      loading.value = false;
    }
  };

  // Reset
  const resetState = () => {
    documentTypes.value = [];
    selectedType.value = null;
    error.value = null;
  };

  return {
    // State
    documentTypes,
    selectedType,
    loading,
    error,

    // Getters
    activeTypes,
    getTypeById,
    getTypeByCode,

    // Actions
    fetchAllTypes,
    fetchTypeById,
    createType,
    updateType,
    deleteType,
    getNextFolio,
    getStatistics,
    searchTypes,
    resetState,
  };
});
