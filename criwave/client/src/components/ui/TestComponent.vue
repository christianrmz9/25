<template>
  <div class="test-component">
    <h2>Componente de prueba</h2>
    <p>Si puedes ver este texto, Vue está funcionando correctamente.</p>
    <button @click="incrementCounter">Contador: {{ counter }}</button>
  </div>
</template>

<script>
export default {
  name: 'TestComponent',
  
  data() {
    return {
      counter: 0
    };
  },
  
  methods: {
    incrementCounter() {
      this.counter++;
    }
  }
};
</script>

<style scoped>
.test-component {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--bg-secondary);
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}
</style> 