<template>
  <div class="chart-skeleton" :class="[size]">
    <div class="chart-skeleton-header">
      <div class="skeleton-title"></div>
      <div class="skeleton-subtitle"></div>
    </div>
    <div class="chart-skeleton-body">
      <div class="skeleton-bars">
        <div class="skeleton-bar" v-for="i in barsCount" :key="i"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartSkeleton',
  props: {
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    barsCount: {
      type: Number,
      default: 5
    }
  }
}
</script>

<style scoped>
.chart-skeleton {
  width: 100%;
  background-color: var(--bg-secondary, #f5f5f5);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: pulse 1.5s ease-in-out infinite;
}

.chart-skeleton.small {
  height: 150px;
}

.chart-skeleton.medium {
  height: 250px;
}

.chart-skeleton.large {
  height: 350px;
}

.chart-skeleton-header {
  margin-bottom: 24px;
}

.skeleton-title {
  height: 24px;
  width: 40%;
  background-color: var(--skeleton-color, rgba(0, 0, 0, 0.1));
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-subtitle {
  height: 16px;
  width: 25%;
  background-color: var(--skeleton-color, rgba(0, 0, 0, 0.1));
  border-radius: 4px;
}

.chart-skeleton-body {
  height: calc(100% - 50px);
  display: flex;
  align-items: flex-end;
}

.skeleton-bars {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.skeleton-bar {
  width: calc(100% / var(--bars-count, 5) - 10px);
  background-color: var(--skeleton-color, rgba(0, 0, 0, 0.1));
  border-radius: 4px 4px 0 0;
}

.skeleton-bar:nth-child(1) { height: 65%; }
.skeleton-bar:nth-child(2) { height: 85%; }
.skeleton-bar:nth-child(3) { height: 40%; }
.skeleton-bar:nth-child(4) { height: 70%; }
.skeleton-bar:nth-child(5) { height: 55%; }
.skeleton-bar:nth-child(6) { height: 80%; }
.skeleton-bar:nth-child(7) { height: 45%; }

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}
</style> 