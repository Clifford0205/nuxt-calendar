<template>
  <div :class="fieldClass">
    <template v-if="field.type === 'textarea'">
      <label v-if="field.showLabel !== false" :for="field.name">{{
        fieldLabel
      }}</label>
      <textarea
        :id="field.name"
        :name="field.name"
        :value="newValue"
        :required="field.required"
        :placeholder="fieldLabel"
        @input="onInput"
      >
      </textarea>
    </template>
    <template v-else>
      <label v-if="field.showLabel !== false" :for="field.name">{{
        fieldLabel
      }}</label>
      <input
        :id="field.name"
        :value="newValue"
        :placeholder="fieldLabel"
        :type="field.type ? field.type : 'text'"
        :required="field.required"
        @input="onInput"
      />
    </template>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'EventDialogInput',
  props: {
    value: [Date, String, Number, Boolean, Array, Object],
    field: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      newValue: this.value,
    };
  },
  computed: {
    isCheckOrRadio() {
      return this.field.type === 'radio' || this.field.type === 'checkbox';
    },
    fieldLabel() {
      return this.field.label ? this.field.label : this.field.name;
    },
    fieldClass() {
      if (this.overrideInputClass) return this.inputClass;

      const classes = ['v-cal-input', this.inputClass];

      if (this.isCheckOrRadio) {
        if (!this.field.choices) {
          classes.push('is-inline');
          classes.push('is-' + this.field.type);
        } else {
          classes.push('v-cal-input-group');
        }
      }

      return classes.join(' ');
    },
  },
  watch: {
    value(value) {
      this.newValue = value;
    },
    newValue(value) {
      let res = value;

      if (this.field.type === 'time') {
        res = moment(this.newValue, 'HH:mm');
      }

      this.$emit('input', res);
    },
  },
  beforeMount() {
    //  Date workaround
    if (this.field.type === 'date' && this.value) {
      this.newValue = moment(this.value).format().slice(0, 10);
    }

    //  Time workaround
    if (this.field.type === 'time' && this.value) {
      this.newValue = moment(this.value).format().slice(11, 16);
    }
  },
  methods: {
    onInput(event) {
      this.$nextTick(() => {
        this.newValue = event.target.value;
      });
    },
  },
};
</script>

<style scoped></style>
