const colors = require('tailwindcss/colors')
// https://github.com/bradlc/tailwindcss-fluid
module.exports = {
  darkMode: 'class',
  purge: {
    content: ['./src/**/*.html', './src/**/*.svelte'],
  },
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      yellow: colors.amber,
      blue: colors.lightBlue,
      red: colors.red,
      orange: colors.orange,
      green: colors.green
    },
    container: {
      center: true,
      padding: '1rem'
    },

    fontFamily: {
      'sans': [
        "-apple-system",
        "BlinkMacSystemFont",
        "avenir next",
        "avenir",
        "helvetica neue",
        "helvetica",
        "Ubuntu",
        "roboto",
        "noto",
        "segoe ui",
        "arial",
        "sans-serif" 
      ],
      'serif': [
        "Iowan Old Style",
        "Apple Garamond",
        "Baskerville",
        "Times New Roman",
        "Droid Serif",
        "Times",
        "Source Serif Pro",
        "serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol"
      ],
      'mono': [
        "Menlo",
        "Consolas",
        "Monaco",
        "Liberation Mono",
        "Lucida Console",
        "monospace"
      ],
    },
    extend: {},
  },
  corePlugins: {
    float: false,
    objectPosition: false,
    backgroundAttachment: false,
    backgroundClip: false,
    animation: false,
    alignSelf: false,
    alignContent: false,
    justifyItems: false,
    justifySelf: false,
    listStylePosition: false,
    placeContent: false,
    placeholderColor: false,
    placeholderOpacity: false,
    resize: false,
    tableLayout: false,
    clear: false,
    outline: false,
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['active'],
    },
  },
  textSizes: {
    xs: {
      min: '14px',
      max: '18px',
      minvw: '320px',
      maxvw: '1400px'
    },
    sm: {
      min: '16px',
      max: '20px',
      minvw: '320px',
      maxvw: '1400px'
    },
    md: {
      min: '18px',
      max: '22px',
      minvw: '320px',
      maxvw: '1400px'
    },
    lg: {
      min: '22px',
      max: '28px',
      minvw: '320px',
      maxvw: '1400px'
    },
    xl: {
      min: '26px',
      max: '32px',
      minvw: '320px',
      maxvw: '1400px'
    },
    xxl: {
      min: '30px',
      max: '38px',
      minvw: '320px',
      maxvw: '1400px'
    }
  },
  modules: {
    textSizes: false // disable the core module
  },
  plugins: [
    require('tailwindcss-fluid')({
      suffix: '',
      textSizes: true
    })
  ],
}

