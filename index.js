// ==================================================
//
// Breakpoint Utility
// Requires css setup to set content of 'sm', 'md', 'lg', 'xl' on body :before
//
// ==================================================

import {mobileRE, throttle, omit} from 'savnac-utils'

const SIZES = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl'
}

const breakpoint = () => {
  let props = {
    modules: {},
    currentBreakpoint: null,
    isMobile: null,
    isMobileDevice: null
  }

  props.currentBreakpoint = checkBreakpoint()
  props.isMobile = checkMobileBp()
  props.isMobileDevice = checkMobileDevice()
  document.documentElement.classList.add(props.isMobileDevice ? 'touch' : 'no-touch')

  let cbs = {}

  // ------------------------------------------------
  // grabs the document body :before pseudo element content.
  // ------------------------------------------------
  function checkBreakpoint () {
    return window.getComputedStyle(document.body, ':before').getPropertyValue('content').replace(/"/g, '')
  }

  // ------------------------------------------------
  // checks if the currentBreakpoint is 'sm' or 'md'. returns a boolean
  // ------------------------------------------------
  function checkMobileBp () {
    return isBreakpoint(SIZES.sm) || isBreakpoint(SIZES.md)
  }

  // ------------------------------------------------
  // checks if the currentBreakpoint is whatever is passed
  // ------------------------------------------------
  function isBreakpoint (bp) { return props.currentBreakpoint === bp }

  // ------------------------------------------------
  // Tests for mobile device. returns a boolean.
  // ------------------------------------------------
  function checkMobileDevice () { return mobileRE.test(navigator.userAgent) }

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
  const addModule = (mod) => {
    props.modules = Object.assign({},
      props.modules,
      mod
    )

    Object.keys(mod).forEach(m => {
      if (!!mod[m][props.currentBreakpoint]) mod[m][props.currentBreakpoint]()
    })
  }

  // ------------------------------------------------
  // Removes the modules from props modules. moduleName argument is a string to reference key
  // ------------------------------------------------
  const removeModule = moduleName => {
    props.modules = omit(props.modules, moduleName)
  }

  // ------------------------------------------------
  // Loop through the modules and run the callback for the current breakpoint (if it exists)
  // ------------------------------------------------
  const runResponsive = () => {
    let { modules, currentBreakpoint } = props
    for (let key in modules) {
      if (modules.hasOwnProperty(key) && !!modules[key][currentBreakpoint]) {
        modules[key][currentBreakpoint]()
      }
    }
  }

  // ------------------------------------------------
  // On resize, set new breakpoint
  // ------------------------------------------------
  const onResize = () => {
    const newBreakpoint = checkBreakpoint()

    if (newBreakpoint !== props.currentBreakpoint) {
      props.currentBreakpoint = newBreakpoint
      props.isMobile = checkMobileBp()
      runResponsive()
    }

    return
  }

  const enable = () => {
    if (props.isEnabled) return
    cbs.resizeHandler = throttle(onResize, 100)

    window.addEventListener('resize', cbs.resizeHandler)
    props.isEnabled = true
  }

  const disable = () => {
    if (!props.isEnabled) return

    window.removeEventListener('resize', cbs.resizeHandler)
    props.isEnabled = false
  }

  return {
    runResponsive,
    enable,
    addModule,
    disable,
    removeModule,
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
