import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

import { IronResizableBehavior } from '@polymer/iron-resizable-behavior';

import dayjs from 'dayjs';

/**
 * `paper-calendar`
 * A Google Calendar inspired widget displaying current month.
 *
 * **NOTE:** Whenever needed to provide date value, use Unix timestamp (this number that is returned by e.g. `new Date().getTime()`).
 *
 * If `selectable` is set to true, element will fire bubbing events `date-selected` with `details` as date provided in Unix timestamp.
 *
 * ### Events
 *
 * This element can preview events on displalyed calendar.
 *
 * List of events to display. Provided as an array of objects like this:
 * ````
 * [
 *   {
 *     name: 'event-name', // Optional, only for cleaner view at events, won't get rendered anyway
 *     date: '1482766107232', // Hours, minutes, seconds will be ignored
 *     color: '##03a9f4' // Dots indicating events will have this color; optional
 *   },
 *   {
 *     date: '1463522400000',
 *     color: 'purple' // Can be any valid CSS color
 *   }
 * ]
 * ````
 *
 * ### Styling
 *
 * **NOTE:** This widget shouldn't be smaller than 210x180
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--paper-calendar-header-text-color` | Color of days' names | `rgba(0,0,0,0.54)`
 * `--paper-calendar-header` | Mixin aplied to days' names | `{}`
 * `--paper-calendar-text-color` | Color of dates | `rgba(0,0,0,0.87)`
 * `--paper-calendar-text` | Mixin aplied to dates | `{}`
 * `--paper-calendar-selected-color` | Color of text of selected date | `white`
 * `--paper-calendar-selected-background` | Background of selected date. Also default color of events | `#3367d6`
 * `--paper-calendar-text-hover` | Background of date being hovered over | `rgba(0,0,0,0.12)`
 * `--paper-calendar-background` | Backround of the element | `none`
 * `--paper-calendar-table` | Mixin aplied to table (Each page is rendered as table) | `{}`
 *
 * @demo demo/index.html 
 */

var template = html`
  <style>
    :host {
      display: block;
      min-width: 210px;
      min-height: 180px;
      position: relative;
      overflow: hidden;
    }
    
    #main, table {
      width: 100%;
      height: 100%;
    }
    
    table {
      background: var(--paper-calendar-background, none);
      
      @apply --paper-calendar-table;
    }
    
    th {
      text-transform: uppercase;
      height: 30px;
      font-weight: 500;
      color: var(--paper-calendar-header-text-color, rgba(0,0,0,0.54));
      
      @apply --paper-calendar-header;
    }
    
    tr, td, th {
      text-align: center;
      vertical-align: middle;
    }
    
    td {
      color: var(--paper-calendar-text-color, rgba(0,0,0,0.87));
      position: relative;
      
      @apply --paper-calendar-text;
    }
    
    :host([selectable]) td div:hover, :host([selectable]) td div:focus {
      background-color: var(--paper-calendar-text-hover, rgba(0,0,0,0.12));
    }
    
    :host(:not([allow-text-selection])) {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      cursor: default;
    }
    
    :host(:not([allow-text-selection])) td div {
      cursor: pointer;
    }
    
    td div {
      height: 30px;
      width: 30px;
      border-radius: 15px;
      margin: auto;
      text-align: center;
      vertical-align: middle;
      line-height: 30px;
    }
    
    td div[selected] {
      background-color: var(--paper-calendar-selected-background, #3367d6) !important;
      color: var(--paper-calendar-selected-color, white) !important;
    }
    
    .i-1, .i1 {
      position: absolute;
      top: 0;
      bottom: 0;
    }
    
    td .events {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      -ms-flex-direction: row;
      -webkit-flex-direction: row;
      flex-direction: row;
      -ms-flex-pack: center;
      -webkit-justify-content: center;
      justify-content: center;
    }
    
    .event-dot {
      margin: 0 1px;
      width: 5px;
      height: 5px;
      display: block;
      border-radius: 50%;
      background-color: var(--paper-calendar-selected-background, #3367d6);
      border: 1px solid var(--paper-calendar-background, white);
    }
    
  </style>

  <div id="main">
    <table class="i-1">
      <tr>
        <template is="dom-repeat" items="[[_days]]">
          <th>[[item]]</th>
        </template>
      </tr>
    </table>
    <table class="i0">
      <tr>
        <template is="dom-repeat" items="[[_days]]">
          <th>[[item]]</th>
        </template>
      </tr>
    </table>
    <table class="i1">
      <tr>
        <template is="dom-repeat" items="[[_days]]">
          <th>[[item]]</th>
        </template>
      </tr>
    </table>
  </div>
`;

Polymer({

  _template: template,

  is: 'paper-calendar',
  
  behaviors: [
    IronResizableBehavior
  ],

  properties: {
    
    /**
     * Selected date. Use Unix timestamp (in ms).
     */
    selected: {
      type: Number,
      value: function() { return new Date().getTime(); },
      notify: true,
      observer: '_selectedChanged'
    },
    
    /**
     * Events to display. Check events section of description
     */
    events: {
      type: Array,
      observer: '_renderEvents'
    },
    
    /**
     * First day of the week. 0 = Sunday, 1 = Monday, etc. Overrides locale.
     */
    firstDay: {
      type: Number
    },
    
    /**
     * If set to true, user can click on values. Even if false, provided `selected` value will be selected.
     */
    selectable: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    },
    
    /**
     * Currently displayed month. Use unix timestamp (in ms).
     */
    selectedMonth: {
      type: Number,
      notify: true,
      value: function() {
        return Date.now();
      },
      observer: '_monthChanged'
    },
    
    /**
     * Allow user to swipe left/right to switch months.
     */
    swipeable: {
      type: Boolean,
      value: false,
      observer: '_setupMoveListeners'
    },
    
    /**
     * Direction in which user can swipe. Available: `'horizontal'`, `'vertical'`.
     */
    swipeDirection: {
      type: String,
      value: 'horizontal',
      observer: '_switchTranslateDir'
    },
    
    /**
     * Allow user to select text in widget. This can potentially break `swipeable`
     */
    allowTextSelection: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    },
    
    /**
     * Locale string (eg. en, fr, de, ja).
     */
    locale: {
      type: String,
      value: function() {
        return window.navigator.language || window.navigator.userLanguage;
      },
      observer: '_localeChanged'
    },
    
    _days: Array
    
  },
  
  listeners: {
    'iron-resize': '_switchTranslateDir',
    'tap': '_tapped'
  },

  ready: function() {
    this._showCalendars();
    this._setupMoveListeners(this.swipeable);
  },
  
  _localeChanged: function(locale) {
    locale = locale.match(/[a-z]{2}/)[0]; // This hurts
    (locale === 'en' ? Promise.resolve() :
    import('dayjs/locale/' + locale))
      .then(() => {
        dayjs.locale(locale);
        var days = [];
        if (this.firstDay) {
          var d = this.firstDay;
          for (var i = 0; i < 7; i++) {
            days[i] = dayjs().set('day', d).format('ddd').charAt(0);
            if (d > 5) {
              d = 0;
            } else {
              d++;
            }
          }
        } else {
          for (var i = 0; i < 7; i++) {
            days[i] = dayjs().set('day', i).format('ddd').charAt(0);
          }
        }
        
        this.set('_days', days);
        
        this._showCalendars();
      });
  },
  
  _showCalendars: function() {
    if (!this.$$('#main')) return;
    this.$$('table.i-1').removeAttribute('style');
    this.$$('table.i0').removeAttribute('style');
    this.$$('table.i1').removeAttribute('style');
    this._months = {};
    this._renderCalendar(0);
    this._renderCalendar(-1);
    this._renderCalendar(1);
    this._switchTranslateDir(this.swipeable);
    this._selectedChanged(this.selected);
    this._renderedEvents = [];
    this._renderEvents(this.events);
  },
  
  _renderCalendar: function(i) {
    if (!this.$$('#main')) return;
    var table = this.$$('table.i' + i + ' tbody');
    if (table.children.length !== 1) {
      Array.prototype.slice.call(table.children, 1).forEach(function(node) {
        table.removeChild(node);
      });
    }
    var tr = document.createElement('tr');
    var startDay = dayjs(this.selectedMonth).add(i,'M').date(1) - dayjs().day(0);
    if (startDay < 0) {
      startDay = 7 + startDay;
    }
    var month = [];
    var week = new Array(startDay);
    for (var j = 0; j < startDay; j++) {
      var td = document.createElement('td');
      tr.appendChild(td);
    }
    var times = dayjs(this.selectedMonth).add(i,'M').daysInMonth();
    for (var j = 0; j < times; j++) {
      var td = document.createElement('td');
      td.innerHTML = '<div>' + (j + 1) + '</div> \
                      <span class="events"></span>';
      if (week.length > 6) {
        table.appendChild(tr);
        week = [0];
        tr = document.createElement('tr');
        tr.appendChild(td);
      } else {
        week.push(0);
        tr.appendChild(td);
      }
      month[j] = td;
    }
    table.appendChild(tr);
    if (i === 0) {
      this._months.current = month;
    } else if (i === 1) {
      this._months.next = month;
    } else if (i === -1) {
      this._months.last = month;
    } else {
      console.warn('_renderCalendar called with invalid i=',i);
    }
  },
  
  _monthChanged: function(newVal, oldVal) {
    this._showCalendars();
  },
  
  _setupMoveListeners: function(swipeable) {
    if (swipeable) {
      this.listen(this, 'track', '_handleTrack');
    } else {
      this.unlisten(this, 'track', '_handleTrack');
      this.setScrollDirection('all', this);
    }
    requestAnimationFrame(this._switchTranslateDir.bind(this));
  },
  
  _handleTrack: function(e) {
    if (!this.$$('#main')) return;
    var tleft = this.$$('.i-1');
    var tcenter = this.$$('.i0');
    var tright = this.$$('.i1');
    switch(e.detail.state) {
      case 'start':
        // ¯\_(ツ)_/¯
        break;
      case 'track':
        if (!this._touchDir) {
          this._touchDir = Math.abs(e.detail.dx) > Math.abs(e.detail.dy) ? 'horizontal' : 'vertical';
        }
        if (this._touchDir === this.swipeDirection) {
          if (this.swipeDirection === 'horizontal') {
            this._translateX(tleft, e.detail.dx - this.offsetWidth);
            this._translateX(tcenter, e.detail.dx);
            this._translateX(tright, e.detail.dx + this.offsetWidth);
          } else {
            this._translateY(tleft, e.detail.dy - this.offsetHeight);
            this._translateY(tcenter, e.detail.dy);
            this._translateY(tright, e.detail.dy + this.offsetHeight);
          }
        }
        break;
      case 'end':
        if (this.swipeDirection === 'horizontal') {
          var threshold = e.detail.dx / this.offsetWidth;
          if (threshold > 0.2) {
            this._translateX(tleft, 0, true);
            this._translateX(tcenter, this.offsetWidth, true);
            this._translateX(tright, this.offsetWidth * 2, true);
            setTimeout(function() {
              this.selectedMonth = dayjs(this.selectedMonth).add(-1, 'M').valueOf();
            }.bind(this), 200);
          } else if (threshold < -0.2) {
            this._translateX(tright, -2, true);
            this._translateX(tcenter, this.offsetWidth * -1, true);
            this._translateX(tright, this.offsetWidth * 0, true);
            setTimeout(function() {
              this.selectedMonth = dayjs(this.selectedMonth).add(1, 'M').valueOf();
            }.bind(this), 200);
          } else {
            this._translateX(tleft, this.offsetWidth * -1, true);
            this._translateX(tcenter, 0, true);
            this._translateX(tright, this.offsetWidth, true);
          }
        } else {
          var threshold = e.detail.dy / this.offsetHeight;
          if (threshold > 0.2) {
            this._translateY(tleft, 0, true);
            this._translateY(tcenter, this.offsetHeight, true);
            this._translateY(tright, this.offsetHeight * 2, true);
            setTimeout(function() {
              this.selectedMonth = dayjs(this.selectedMonth).add(-1, 'M').valueOf();
            }.bind(this), 200);
          } else if (threshold < -0.2) {
            this._translateY(tright, -2, true);
            this._translateY(tcenter, this.offsetHeight * -1, true);
            this._translateY(tright, this.offsetHeight * 0, true);
            setTimeout(function() {
              this.selectedMonth = dayjs(this.selectedMonth).add(1, 'M').valueOf();
            }.bind(this), 200);
          } else {
            this._translateY(tleft, this.offsetHeight * -1, true);
            this._translateY(tcenter, 0, true);
            this._translateY(tright, this.offsetHeight, true);
          }
        }
        this._touchDir = null;
        break;
    }
  },
  
  _switchTranslateDir: function() {
    if (!this.$$('#main')) return;
    var tleft = this.$$('.i-1');
    var tright = this.$$('.i1');
    if (this.swipeDirection === 'horizontal') {
      this.setScrollDirection('y', this);
      requestAnimationFrame(function() {
        tleft.style.transform = 'translateX(-' + this.offsetWidth + 'px)';
        tright.style.transform = 'translateX(' + this.offsetWidth + 'px)';
      }.bind(this));
    } else {
      this.setScrollDirection('x', this);
      requestAnimationFrame(function() {
        tleft.style.transform = 'translateY(-' + this.offsetHeight + 'px)';
        tright.style.transform = 'translateY(' + this.offsetHeight + 'px)';
      }.bind(this));
    }
  },
  
  _translateX: function(elem, x, transition) {
    elem.style.transition = transition ? 'transform 200ms' : '';
    elem.style.transform = 'translateX(' + x + 'px)';
  },
  
  _translateY: function(elem, y, transition) {
    elem.style.transition = transition ? 'transform 0.2s' : '';
    elem.style.transform = 'translateY(' + y + 'px)';
  },
  
  _selectedChanged: function(selected) {
    if (!this._months || selected == 0 || !this.$$('#main')) return;
    this._requireSetSelected = false;
    if (this.$$('[selected]')) {
      this.$$('div[selected]').removeAttribute('selected');
    }
    var thisMonth = dayjs(this.selectedMonth);
    selected = dayjs(selected);
    if (selected.month() === thisMonth.month()) {
      var day = this._months.current[selected.date() - 1];
      day.querySelector('div').setAttribute('selected', true);
    } else if (selected.month() === thisMonth.add(1,'M').month()) {
      var day = this._months.next[selected.date() - 1];
      day.querySelector('div').setAttribute('selected', true);
    } else if (selected.month() === thisMonth.add(-1,'M').month()) {
      var day = this._months.last[selected.date() - 1];
      day.querySelector('div').setAttribute('selected', true);
    } else {
      this._requireSetSelected = true;
    }
  },
  
  _renderEvents: function(events) {
    if (!this._months || !events) return;
    this._requireSetEvents = false;
    this._renderedEvents = this._renderedEvents || [];
    events.forEach(item => {
      if (!this._renderedEvents.includes(item)) {
        this._renderedEvents.push(item);
        var thisMonth = dayjs(this.selectedMonth);
        var evDate = dayjs(item.date);
        var el = document.createElement('span');
        el.classList.add('event-dot');
        el.style.backgroundColor = item.color;
        if (evDate.month() === thisMonth.month()) {
          var day = this._months.current[evDate.date() - 1];
          day = day.querySelector('span.events');
          day.appendChild(el);
        } else if (evDate.month() === thisMonth.add(1,'M').month()) {
          var day = this._months.next[evDate.date() - 1];
          day = day.querySelector('span.events');
          day.appendChild(el);
        } else if (evDate.month() === thisMonth.add(-1,'M').month()) {
          var day = this._months.last[evDate.date() - 1];
          day = day.querySelector('span.events');
          day.appendChild(el);
        } else {
          this._requireSetSelected = true;
        }
      }
    });
    this._renderedEvents.forEach(item => {
      if (!events.includes(item)) {
        var deleted = this._renderedEvents.splice(oneArray.indexOf(item), 1);
        console.log('Old one deleted', deleted)
      }
    });
  },
  
  _tapped: function(e) {
    var el = e.target;
    if (el.nodeName === 'DIV' && !el.getAttribute('selected') && this.selectable) {
      var month, day = el.textContent;
      switch (el.parentElement.parentElement.parentElement.parentElement.classList[0]) {
        case 'i0':
          month = dayjs(this.selectedMonth);
          break;
        case 'i1':
          month = dayjs(this.selectedMonth).add(1,'M');
          break;
        case 'i-1':
          month = dayjs(this.selectedMonth).add(-1,'M');
          break;
      }
      this.selected = month.date(day).valueOf();
    }
  }

});