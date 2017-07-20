(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var savnacUtils = require('savnac-utils');

// ==================================================
//
// Breakpoint Utility
// Requires css setup to set content of 'sm', 'md', 'lg', 'xl' on body :before
//
// ==================================================

var SIZES = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl'
};

var breakpoint = function breakpoint() {
  var props = {
    modules: {},
    currentBreakpoint: null,
    isMobile: null,
    isMobileDevice: null
  };

  props.currentBreakpoint = checkBreakpoint();
  props.isMobile = checkMobileBp();
  props.isMobileDevice = checkMobileDevice();
  document.documentElement.classList.add(props.isMobileDevice ? 'touch' : 'no-touch');

  var cbs = {};

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
  // Tests for mobile device. returns a boolean.
  // ------------------------------------------------
  function checkMobileDevice() {
    return savnacUtils.mobileRE.test(navigator.userAgent);
  }

  // ------------------------------------------------
  // Merges a new module into the modules. module argument is an object with the key being the
  // module name and the value is an object with keys of the breakpiont strings and their callbacks.
  // It subsequently runs the responsive callback of the newly added module.
  // eg:
  // module = {
  //   nav: {
  //     sm: function,
  //     md: function,
  //     lg: function,
  //     xl: function
  //   }
  // }
  // ------------------------------------------------
  var addModule = function addModule(mod) {
    props.modules = Object.assign({}, props.modules, mod);

    Object.keys(mod).forEach(function (m) {
      if (!!mod[m][props.currentBreakpoint]) mod[m][props.currentBreakpoint]();
    });
  };

  // ------------------------------------------------
  // Removes the modules from props modules. moduleName argument is a string to reference key
  // ------------------------------------------------
  var removeModule = function removeModule(moduleName) {
    props.modules = savnacUtils.omit(props.modules, moduleName);
  };

  // ------------------------------------------------
  // Loop through the modules and run the callback for the current breakpoint (if it exists)
  // ------------------------------------------------
  var runResponsive = function runResponsive() {
    var modules = props.modules,
        currentBreakpoint = props.currentBreakpoint;

    for (var key in modules) {
      if (modules.hasOwnProperty(key) && !!modules[key][currentBreakpoint]) {
        modules[key][currentBreakpoint]();
      }
    }
  };

  // ------------------------------------------------
  // On resize, set new breakpoint
  // ------------------------------------------------
  var onResize = function onResize() {
    var newBreakpoint = checkBreakpoint();

    if (newBreakpoint !== props.currentBreakpoint) {
      props.currentBreakpoint = newBreakpoint;
      props.isMobile = checkMobileBp();
      runResponsive();
    }

    return;
  };

  var enable = function enable() {
    if (props.isEnabled) return;
    cbs.resizeHandler = savnacUtils.throttle(onResize, 100);

    window.addEventListener('resize', cbs.resizeHandler);
    props.isEnabled = true;
  };

  var disable = function disable() {
    if (!props.isEnabled) return;

    window.removeEventListener('resize', cbs.resizeHandler);
    props.isEnabled = false;
  };

  return {
    runResponsive: runResponsive,
    enable: enable,
    addModule: addModule,
    disable: disable,
    removeModule: removeModule,
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
