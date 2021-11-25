<template>
  <!-- eslint-disable vue/require-v-for-key  -->
  <section class="v-cal-content">
    <div class="v-cal-weekdays">
      <div class="v-cal-weekday-item">{{ activeDate.format('ddd DD/MM') }}</div>
    </div>
    <div class="v-cal-days">
      <div class="v-cal-times">
        <div class="v-cal-hour">{{ allDayLabel }}</div>
        <div
          v-for="time in times"
          class="v-cal-hour"
          :class="{ 'is-now': time.isSame(now, 'hour') }"
        >
          {{ time | formatTime(use12) }}
        </div>
      </div>
      <div class="v-cal-days__wrapper">
        <div
          v-if="day !== null"
          class="v-cal-day v-cal-day--day"
          :class="{ 'is-today': day.isToday }"
        >
          <div
            class="v-cal-day__hour-block"
            @click="timeClicked({ date: day.d.toDate(), time: null })"
          >
            <span class="v-cal-day__hour-block-fill"
              >00:00 <template v-if="use12">PM</template></span
            >
            <div class="v-cal-day__hour-content">
              <div
                class="v-cal-event-list"
                :class="{
                  'tiny-events':
                    day.events.filter(e => !e.startTime).length > 2,
                }"
              >
                <EventItem
                  v-for="(event, index) in day.events.filter(e => !e.startTime)"
                  :key="index"
                  :event="event"
                  :use12="use12"
                  @click.stop="eventBus.$emit('event-clicked', event)"
                >
                </EventItem>
              </div>
            </div>
          </div>
          <div
            v-for="time in day.availableTimes"
            class="v-cal-day__hour-block"
            :class="[time.isSame(now, 'hour') ? 'is-now' : '', hourClass]"
            @click="timeClicked({ date: day.d.toDate(), time: time.hour() })"
          >
            <span class="v-cal-day__hour-block-fill">{{
              time | formatTime(use12)
            }}</span>
            <div class="v-cal-day__hour-content">
              <div class="v-cal-event-list">
                <EventItem
                  v-for="(event, index) in day.events"
                  v-if="
                    event.startTime && time.hours() === event.startTime.hours()
                  "
                  :key="index"
                  :event="event"
                  :use12="use12"
                >
                </EventItem>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import moment from 'moment';
import { EventBus } from '../EventBus';
import EventItem from '../EventItem';
import IsView from '../mixins/IsView';
import ShowsTimes from '../mixins/ShowsTimes';

export default {
  name: 'Day',
  components: { EventItem },
  mixins: [IsView, ShowsTimes],
  data() {
    return {
      day: null,
    };
  },
  mounted() {
    this.buildCalendar();
  },
  methods: {
    timeClicked(data) {
      EventBus.$emit('time-clicked', data);
    },
    buildCalendar() {
      const now = moment();

      const today = moment(this.activeDate);

      const dayEvents = this.events
        .filter(e => moment(e.date).isSame(today, 'day'))
        .sort((a, b) => {
          if (!a.startTime) return -1;
          if (!b.startTime) return 1;
          return (
            moment(a.startTime, 'HH:mm').format('HH') -
            moment(b.startTime, 'HH:mm').format('HH')
          );
        });
      const mappedEvents = dayEvents.map(event => {
        event.overlaps = dayEvents.filter(
          e =>
            moment(event.startTime, 'HH:mm').isBetween(
              moment(e.startTime, 'HH:mm'),
              moment(e.endTime, 'HH:mm')
            ) && e !== event
        ).length;
        return event;
      });

      this.day = {
        d: today,
        isPast: today.isBefore(now, 'day'),
        isToday: today.isSame(now, 'day'),
        availableTimes: this.times,
        events: mappedEvents,
      };
    },
  },
};
</script>

<style scoped></style>
