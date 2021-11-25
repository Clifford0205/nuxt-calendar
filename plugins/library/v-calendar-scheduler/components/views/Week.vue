<template>
  <!-- eslint-disable vue/no-use-v-if-with-v-for  -->
  <!-- eslint-disable vue/require-v-for-key  -->
  <section class="v-cal-content">
    <div class="v-cal-weekdays">
      <div class="v-cal-weekdays__padding">
        <div class="v-cal-times">
          <!--Fake, hidden time-->
          <div class="v-cal-hour">
            00:00 <template v-if="use12">PM</template>
          </div>
        </div>
      </div>
      <div class="v-cal-weekday__wrapper">
        <div v-for="day in days" class="v-cal-weekday-item">
          {{ day.d.format('ddd') }} <br />
          {{ day.d.format('DD') }}
        </div>
      </div>
    </div>
    <div class="v-cal-days">
      <div class="v-cal-times">
        <div class="v-cal-hour all-day">{{ allDayLabel }}</div>
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
          v-for="day in days"
          class="v-cal-day v-cal-day--week"
          :class="{ 'is-today': day.isToday, 'is-disabled': day.isDisabled }"
        >
          <div
            class="v-cal-day__hour-block all-day"
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
                  :has-dynamic-size="false"
                  :use12="use12"
                >
                </EventItem>
              </div>
            </div>
          </div>

          <div
            v-for="time in day.availableTimes"
            class="v-cal-day__hour-block"
            :class="[time.hour() === now.hour() ? 'is-now' : '', hourClass]"
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
// import moment from 'moment';

import { EventBus } from '../EventBus';
import EventItem from '../EventItem';
import IsView from '../mixins/IsView';
import ShowsTimes from '../mixins/ShowsTimes';
import moment from '@/plugins/library/moment/moment.js';

moment.updateLocale('zh-tw', {
  week: {
    dow: 1, // Monday is the first day of the week.
  },
});

export default {
  name: 'Week',
  components: { EventItem },
  mixins: [IsView, ShowsTimes],
  data() {
    return {
      days: [],
      // newEvents: JSON.parse(JSON.stringify(this.events))
    };
  },
  watch: {
    timeRange() {
      this.buildCalendar();
    },
  },
  mounted() {
    setTimeout(() => {
      this.buildCalendar();
    }, 0);
  },
  methods: {
    timeClicked(data) {
      EventBus.$emit('time-clicked', data);
    },
    buildCalendar() {
      //  Reset events
      // this.newEvents = JSON.parse(JSON.stringify(this.events));

      this.days = [];

      // moment.updateLocale('zh-tw', {
      //   week: {
      //     dow: 1, // Monday is the first day of the week.
      //   },
      // });

      const now = moment();

      // eslint-disable-next-line prefer-const
      let temp = moment(this.activeDate).day(
        moment.localeData().firstDayOfWeek()
      );

      const w = temp.week();

      this.days = [];

      do {
        const day = moment(temp);

        const dayEvents = this.events
          .filter(e => e.date.isSame(day, 'day'))
          .sort((a, b) => {
            if (!a.startTime) return -1;
            if (!b.startTime) return 1;
            return (
              moment(a.startTime).format('HH') -
              moment(b.startTime).format('HH')
            );
          });
        const mappedEvents = dayEvents.map(event => {
          event.overlaps = dayEvents.filter(
            e =>
              moment(event.startTime).isBetween(
                moment(e.startTime),
                moment(e.endTime)
              ) && e !== event
          ).length;
          return event;
        });

        const newDay = {
          d: day,
          isPast: temp.isBefore(now, 'day'),
          isToday: temp.isSame(now, 'day'),
          isDisabled: this.isDayDisabled(temp),
          availableTimes: this.times.map(time =>
            moment(time).dayOfYear(day.dayOfYear())
          ),
          events: mappedEvents,
        };
        this.days.push(newDay);
        // console.log(this.days);
        temp.add(1, 'day');
        // eslint-disable-next-line no-undef
      } while (temp.week() === w);
    },
  },
};
</script>

<style scoped></style>
