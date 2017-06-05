// ==================================================
//
// Breakpoint Utility
// Requires css setup to set content of 'sm', 'md', 'lg', 'xl' on body :before
//
// ==================================================

import {mobileRE, throttle, omit} from 'savnac-utils'

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
    return props.currentBreakpoint === 'sm' || props.currentBreakpoint === 'md'
  }

  // ------------------------------------------------
  // Tests for mobile device. returns a boolean.
  // ------------------------------------------------
  function checkMobileDevice () { return mobileRE.test(navigator.userAgent) }

  // ------------------------------------------------
  // ------------------------------------------------
  const setGlobalVars = () => {
    props.currentBreakpoint = checkBreakpoint()
    props.isMobile = checkMobileBp()
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
  const addModule = (module) => {
    props.modules = {
      ...props.modules,
      ...module
    }

    if (!!module[props.currentBreakpoint]) module[props.currentBreakpoint]()
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
      runResponsive()
      setGlobalVars()
    }

    return
  }

  const enable = () => {
    if (props.isEnabled) return
    cbs.resizeHandler = throttle(onResize, 100)

    window.addEventListener('resize', cbs.resizeHandler)
  }

  const disable = () => {
    if (!props.isEnabled) return

    window.removeEventListener('resize', cbs.resizeHandler)
  }

  return {
    runResponsive,
    enable,
    addModule,
    isMobile: () => props.isMobile,
    currentBreakpoint: () => props.currentBreakpoint,
    isMobileDevice: props.isMobileDevice
  }
}

export default breakpoint
