<template>
  <section class="main-content">
    <div class="home">
      <client-only>
        <vue-scheduler
          :min-date="null"
          :max-date="null"
          :labels="{
            today: 'Hoy',
            back: 'Atrás',
            next: 'Siguiente',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            all_day: 'Todo el día',
          }"
          :time-range="[10, 20]"
          :available-views="['month', 'week', 'day']"
          :initial-date="new Date()"
          initial-view="month"
          use12
          :show-today-button="false"
          event-display="eventDisplay"
        />
      </client-only>
    </div>
  </section>
</template>

<script>
export default {};
</script>
