// ==================================================
//
// Breakpoint Utility
// Requires css setup to set content of 'sm', 'md', 'lg', 'xl' on body :before
//
// ==================================================
const EventEmitter = require('wolfy87-eventemitter')
const _ = require('lodash')

const breakpoint = () => {
  const props = {
    currentBreakpoint: '',
    isMobile: null,
    isMobileDevice: false,
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

  // ------------------------------------------------
  // grabs the document body :before pseudo element content.
  // ------------------------------------------------
  const checkBreakpoint = () => {
    return window.getComputedStyle(document.body, ':before').getPropertyValue('content').replace(/"/g, '')
  }

  // ------------------------------------------------
  // checks if the currentBreakpoint is 'sm' or 'md'. returns a boolean
  // ------------------------------------------------
  const checkMobileBp = () => {
    return isBreakpoint(SIZES.sm) || isBreakpoint(SIZES.md)
  }

  // ------------------------------------------------
  // checks if the currentBreakpoint is whatever is passed
  // ------------------------------------------------
  const isBreakpoint = (bp) => props.currentBreakpoint === bp

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

    if (_.includes(eeEvents, listener)) {
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
    if (_.includes(eeEvents, listener)) {
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

    props.currentBreakpoint = checkBreakpoint()
    props.isMobileDevice = 'ontouchstart' in window
    props.isMobile = checkMobileBp()
    document.documentElement.classList.add(props.isMobileDevice ? 'touch' : 'no-touch')

    cbs.resizeHandler = _.debounce(onResize, 100)
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
