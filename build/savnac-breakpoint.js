(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

// ==================================================
//
// Breakpoint Utility
// Requires css setup to set content of 'sm', 'md', 'lg', 'xl' on body :before
//
// ==================================================
var debounce = require('lodash.debounce');
var EventEmitter = require('wolfy87-eventemitter');

var breakpoint = function breakpoint() {
  var props = {
    currentBreakpoint: checkBreakpoint(),
    isMobile: null,
    isMobileDevice: 'ontouchstart' in window,
    ee: new EventEmitter()
  };

  var SIZES = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl'
  };

  var eeEvents = ['change'].concat(toConsumableArray(Object.keys(SIZES).map(function (s) {
    return s + 'Enter';
  })), toConsumableArray(Object.keys(SIZES).map(function (s) {
    return s + 'Exit';
  })));

  var cbs = {};

  props.isMobile = checkMobileBp();
  document.documentElement.classList.add(props.isMobileDevice ? 'touch' : 'no-touch');

  // ------------------------------------------------
  // grabs the document body :before pseudo element content.
  // ------------------------------------------------
  function checkBreakpoint() {
    return window.getComputedStyle(document.body, ':before').getPropertyValue('content').replace(/"/g, '');
  }

  // ------------------------------------------------
  // checks if the currentBreakpoint is 'sm' or 'md'. returns a boolean
  // ------------------------------------------------
  function checkMobileBp() {
    return isBreakpoint(SIZES.sm) || isBreakpoint(SIZES.md);
  }

  // ------------------------------------------------
  // checks if the currentBreakpoint is whatever is passed
  // ------------------------------------------------
  function isBreakpoint(bp) {
    return props.currentBreakpoint === bp;
  }

  // ------------------------------------------------
  // Emits change, enter, and exit events. Updates props with new breakpoint data
  // ------------------------------------------------
  var change = function change(newBreakpoint) {
    props.ee.emitEvent('change');
    props.ee.emitEvent(props.currentBreakpoint + 'Exit');
    props.ee.emitEvent(newBreakpoint + 'Enter');
    props.currentBreakpoint = newBreakpoint;
    props.isMobile = checkMobileBp();
  };

  var on = function on(listener, callback) {
    if (eeEvents.includes(listener)) {
      props.ee.addListener(listener, callback);
    } else {
      logListenerError(listener);
    }
  };

  var off = function off(listener, callback) {
    if (eeEvents.includes(listener)) {
      props.ee.removeListener(listener, callback);
    } else {
      logListenerError(listener);
    }
  };

  var logListenerError = function logListenerError(listener) {
    console.error(listener + ' is not a valid listener. Options are ' + eeEvents.join(', '));
  };

  // ------------------------------------------------
  // On resize, set new breakpoint
  // ------------------------------------------------
  var onResize = function onResize() {
    var newBreakpoint = checkBreakpoint();

    if (newBreakpoint !== props.currentBreakpoint) {
      change(newBreakpoint);
    }
  };

  var enable = function enable() {
    if (props.isEnabled) return;
    cbs.resizeHandler = debounce(onResize, 100);

    window.addEventListener('resize', cbs.resizeHandler);
    props.ee.emitEvent(props.currentBreakpoint + 'Enter');

    props.isEnabled = true;
  };

  var disable = function disable() {
    if (!props.isEnabled) return;

    window.removeEventListener('resize', cbs.resizeHandler);
    props.isEnabled = false;
  };

  return {
    enable: enable,
    disable: disable,
    on: on,
    off: off,
    isMobileDevice: props.isMobileDevice,
    isMobile: function isMobile() {
      return props.isMobile;
    },
    currentBreakpoint: function currentBreakpoint() {
      return props.currentBreakpoint;
    },
    isSmall: function isSmall() {
      return isBreakpoint(SIZES.sm);
    },
    isMedium: function isMedium() {
      return isBreakpoint(SIZES.md);
    },
    isLarge: function isLarge() {
      return isBreakpoint(SIZES.lg);
    },
    isXL: function isXL() {
      return isBreakpoint(SIZES.xl);
    }
  };
};

module.exports = breakpoint;

})));
