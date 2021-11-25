<template>
  <!-- eslint-disable vue/require-v-for-key  -->
  <section class="v-cal-content">
    <div class="v-cal-weekdays">
      <div v-for="weekday in weekdaysNew" class="v-cal-weekday-item">
        {{ weekday }}
      </div>
    </div>
    <div v-for="row in calendar" class="v-cal-days">
      <div
        v-for="day in row"
        :ref="'days.day_' + day.d.format('DDD')"
        class="v-cal-day v-cal-day--month"
        :class="{
          'is-today': day.isToday,
          'is-past': day.isPast,
          'is-disabled': day.isDisabled,
          'is-different-month': day.isDifferentMonth,
        }"
        @click="dayClicked(day)"
      >
        <span class="v-cal-day__number">{{ day.d.date() }}</span>
        <div class="v-cal-event-list">
          <EventItem
            v-for="(event, index) in day.events"
            :key="index"
            :has-dynamic-size="false"
            :event="event"
            :use12="use12"
          >
          </EventItem>
          <!--@click.stop="eventBus.$emit('event-clicked', event)" -->
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
import moment from '@/plugins/library/moment/moment.js';

export default {
  name: 'Month',
  components: { EventItem },
  mixins: [IsView],
  data() {
    return {
      weekdays: moment.weekdaysShort(),
      calendar: [],
    };
  },
  computed: {
    weekdaysNew() {
      const arr = [...this.weekdays];
      const firstElement = arr.shift();
      arr.push(firstElement);
      return arr;
    },
  },
  mounted() {
    this.buildCalendar();
  },
  methods: {
    dayClicked(day) {
      EventBus.$emit('day-clicked', day.d.toDate());
    },
    buildCalendar() {
      this.calendar = [];

      const temp = moment(this.activeDate).date(1);
      const monthStart = moment(temp);
      const m = temp.month();
      const now = moment();

      this.days = [];

      do {
        // console.log(temp.toDate());
        const day = moment(temp);
        const newDay = {
          d: day,
          isPast: temp.isBefore(now, 'day'),
          isToday: temp.isSame(now, 'day'),
          isDisabled: this.isDayDisabled(temp),
          events: this.events
            .filter(e => moment(e.date).isSame(day, 'day'))
            .sort((a, b) => {
              if (!a.startTime) return -1;
              if (!b.startTime) return 1;
              return (
                moment(a.startTime, 'HH:mm').format('HH') -
                moment(b.startTime, 'HH:mm').format('HH')
              );
            }),
        };
        this.days.push(newDay);

        temp.add(1, 'day');
      } while (temp.month() === m);

      const items = [];

      let paddingOffset = 1;
      // Some padding at the beginning
      // 由於是禮拜一當作第一天 所以要weekday() - 1
      for (let p = 0; p < moment(this.activeDate).date(1).weekday() - 1; p++) {
        items.unshift({
          d: moment(monthStart).subtract(paddingOffset, 'day'),
          isPast: true,
          isToday: false,
          isDifferentMonth: true,
        });

        paddingOffset++;
      }

      // Merge in the array of days
      items.push.apply(items, this.days);

      // Some padding at the end if required
      if (items.length % 7) {
        for (let p = 7 - (items.length % 7); p > 0; p--) {
          items.push({
            d: moment(temp),
            isPast: true,
            isToday: false,
            isDifferentMonth: true,
          });
          temp.add(1, 'day');
        }
      }

      // Split the array into "chunks" of seven
      this.calendar = items
        .map(function (e, i) {
          return i % 7 === 0 ? items.slice(i, i + 7) : null;
        })
        .filter(function (e) {
          return e;
        });
    },
  },
};
</script>

<style scoped></style>
