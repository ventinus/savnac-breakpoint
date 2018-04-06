// ==================================================
//
// Breakpoint Utility
// Requires css setup to set content of 'sm', 'md', 'lg', 'xl' on body :before
//
// ==================================================
const debounce = require('lodash.debounce')
const EventEmitter = require('wolfy87-eventemitter')

const breakpoint = () => {
  const props = {
    currentBreakpoint: checkBreakpoint(),
    isMobile: null,
    isMobileDevice: 'ontouchstart' in window,
    ee: new EventEmitter()
  }

  const SIZES = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl'
  }

  const eeEvents = ['change']

  const cbs = {}

  props.isMobile = checkMobileBp()
  document.documentElement.classList.add(props.isMobileDevice ? 'touch' : 'no-touch')

  // ------------------------------------------------
  // grabs the document body :before pseudo element content.
  // ------------------------------------------------
  function checkBreakpoint() {
    return window.getComputedStyle(document.body, ':before').getPropertyValue('content').replace(/"/g, '')
  }

  // ------------------------------------------------
  // checks if the currentBreakpoint is 'sm' or 'md'. returns a boolean
  // ------------------------------------------------
  function checkMobileBp() {
    return isBreakpoint(SIZES.sm) || isBreakpoint(SIZES.md)
  }

  // ------------------------------------------------
  // checks if the currentBreakpoint is whatever is passed
  // ------------------------------------------------
  function isBreakpoint(bp) { return props.currentBreakpoint === bp }

  // ------------------------------------------------
  // Emits change, enter, and exit events. Updates props with new breakpoint data
  // ------------------------------------------------
  const change = newBreakpoint => {
    props.ee.emitEvent('change', [{
      newBreakpoint,
      previousBreakpoint: props.currentBreakpoint
    }])

    props.currentBreakpoint = newBreakpoint
    props.isMobile = checkMobileBp()
  }

  const on = (listener, callback, opts = {}) => {
    if (props.currentBreakpoint.length === 0) {
      props.currentBreakpoint = checkBreakpoint()
    }

    if (eeEvents.includes(listener)) {
      props.ee.addListener(listener, callback)

      // option to execute the callback immediately after adding listener
      if (opts.leading) {
        callback({
          newBreakpoint: props.currentBreakpoint,
          previousBreakpoint: null
        })
      }
    } else {
      logListenerError(listener)
    }
  }

  const off = (listener, callback) => {
    if (eeEvents.includes(listener)) {
      props.ee.removeListener(listener, callback)
    } else {
      logListenerError(listener)
    }
  }

  const logListenerError = listener => {
    console.error(`${listener} is not a valid listener. Options are ${eeEvents.join(', ')}`)
  }

  // ------------------------------------------------
  // On resize, set new breakpoint
  // ------------------------------------------------
  const onResize = () => {
    const newBreakpoint = checkBreakpoint()

    if (newBreakpoint !== props.currentBreakpoint) {
      change(newBreakpoint)
    }
  }

  const enable = () => {
    if (props.isEnabled) return
    cbs.resizeHandler = debounce(onResize, 100)

    window.addEventListener('resize', cbs.resizeHandler)
    props.isEnabled = true
  }

  const disable = () => {
    if (!props.isEnabled) return

    window.removeEventListener('resize', cbs.resizeHandler)
    props.isEnabled = false
  }

  return {
    enable,
    disable,
    on,
    off,
    isMobileDevice: props.isMobileDevice,
    isMobile: () => props.isMobile,
    currentBreakpoint: () => props.currentBreakpoint,
    isSmall: () => isBreakpoint(SIZES.sm),
    isMedium: () => isBreakpoint(SIZES.md),
    isLarge: () => isBreakpoint(SIZES.lg),
    isXL: () => isBreakpoint(SIZES.xl)
  }
}

export default breakpoint
