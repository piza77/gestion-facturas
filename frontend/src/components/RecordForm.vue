<template>
  <form @submit.prevent="submitForm" style="display: flex; flex-direction: column; gap: 1rem;">
    <!-- Form Fields -->
    <div style="display: grid; gap: 1rem;">
      <div v-for="col in schema?.columns" :key="col.name" style="display: flex; flex-direction: column; gap: 0.25rem;">
        <label style="font-weight: 600; color: #374151; font-size: 0.875rem;">
          {{ col.name }}
          <span v-if="!col.nullable" style="color: red;">*</span>
        </label>
        
        <!-- Text Input -->
        <input 
          v-if="isTextType(col.type)"
          v-model="formData[col.name]"
          :type="col.type === 'email' ? 'email' : 'text'"
          :placeholder="col.name"
          :required="!col.nullable"
          style="padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.875rem;"
        />

        <!-- Textarea for long text -->
        <textarea 
          v-else-if="isLongTextType(col.type)"
          v-model="formData[col.name]"
          :placeholder="col.name"
          :required="!col.nullable"
          rows="3"
          style="padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.875rem; font-family: inherit;"
        ></textarea>

        <!-- Number Input -->
        <input 
          v-else-if="isNumberType(col.type)"
          v-model="formData[col.name]"
          type="number"
          :placeholder="col.name"
          :step="col.type === 'DECIMAL' ? '0.01' : '1'"
          :required="!col.nullable"
          style="padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.875rem;"
        />

        <!-- Date Input -->
        <input 
          v-else-if="isDateType(col.type)"
          v-model="formData[col.name]"
          :type="col.type === 'time' ? 'time' : col.type === 'datetime' ? 'datetime-local' : 'date'"
          :required="!col.nullable"
          style="padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.875rem;"
        />

        <!-- Checkbox for Boolean -->
        <div v-else-if="col.type === 'BOOLEAN'" style="display: flex; align-items: center; gap: 0.5rem;">
          <input 
            :id="`${col.name}-check`"
            v-model="formData[col.name]"
            type="checkbox"
          />
          <label :for="`${col.name}-check`">{{ col.name }}</label>
        </div>

        <!-- Default -->
        <input 
          v-else
          v-model="formData[col.name]"
          type="text"
          :placeholder="col.name"
          :required="!col.nullable"
          style="padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.875rem;"
        />
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="errors.length" style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 0.25rem; padding: 0.75rem; color: #991b1b;">
      <ul style="margin: 0; padding-left: 1.25rem;">
        <li v-for="(error, idx) in errors" :key="idx">{{ error }}</li>
      </ul>
    </div>

    <!-- Form Actions -->
    <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
      <button type="button" @click="$emit('cancel')" style="padding: 0.5rem 1rem; background: #e5e7eb; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: 500;">
        Cancelar
      </button>
      <button type="submit" :disabled="submitting" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: 500;">
        <span v-if="submitting">⏳ Guardando...</span>
        <span v-else>{{ record ? '💾 Actualizar' : '➕ Crear' }}</span>
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'RecordForm',
  props: {
    tableName: {
      type: String,
      required: true
    },
    schema: {
      type: Object,
      default: null
    },
    record: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formData: {},
      errors: [],
      submitting: false
    };
  },
  watch: {
    record() {
      this.initializeForm();
    }
  },
  methods: {
    initializeForm() {
      this.formData = {};
      if (this.schema?.columns) {
        this.schema.columns.forEach(col => {
          this.formData[col.name] = this.record?.[col.name] || null;
        });
      }
    },
    isTextType(type) {
      return ['VARCHAR', 'CHAR', 'STRING', 'TEXT'].includes(type?.toUpperCase());
    },
    isLongTextType(type) {
      return ['LONGTEXT', 'TEXT'].includes(type?.toUpperCase());
    },
    isNumberType(type) {
      return ['INT', 'INTEGER', 'FLOAT', 'DOUBLE', 'DECIMAL', 'NUMERIC', 'BIGINT', 'SMALLINT'].includes(type?.toUpperCase());
    },
    isDateType(type) {
      return ['DATE', 'DATETIME', 'TIMESTAMP', 'TIME'].includes(type?.toUpperCase());
    },
    async submitForm() {
      this.errors = [];
      this.submitting = true;
      try {
        this.$emit('save', this.formData);
      } catch (error) {
        this.errors.push(error.message);
      } finally {
        this.submitting = false;
      }
    }
  },
  mounted() {
    this.initializeForm();
  }
};
</script>

<style scoped>
/* Inline styles used throughout */
</style>
