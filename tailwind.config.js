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
      blueGray: colors.blueGray,
      trueGray: colors.trueGray,
      yellow: colors.amber,
      blue: colors.lightBlue,
      cyan: colors.cyan,
      red: colors.red,
      orange: colors.orange,
      green: colors.green,
      rose: colors.rose,
      pink: colors.pink
    },
    container: {
      padding: '1rem'
    },
    extend: {
      colors: {
        gray: {
          850: '#232326'
        }
      },
      typography: (theme) => ({
        DEFAULT: {

        }
      })
    },
    fontFamily: {
      'mono': [
        'Menlo',
        'Consolas',
        'Monaco',
        'Liberation Mono',
        'Lucida Console',
        'monospace'
      ],
    },
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
    container: false,
    fontSmoothing: false,
    fontVariantNumeric: false,
    gridAutoColumns: false,
    gridAutoColumns: false,
    gridAutoRows: false,
    gridColumn: false,
    gridColumnEnd: false,
    gridColumnStart: false,
    gridRow: false,
    gridRowEnd: false,
    gridRowStart: false,
    gridTemplateColumns: false,
    gridTemplateRows: false,
    listStylePosition: false,
    objectPosition: false,
    placeContent: false,
    placeItems: false,
    placeSelf: false,
    resize: false,
    space: false,
    strokeWidth: false,
    tableLayout: false
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['active'],
      backgroundOpacity: ['dark'],
    },
  },
  textSizes: {
    xs: '18px',
    sm: {
      min: '16px',
      max: '20px',
      minvw: '320px',
      maxvw: '1400px'
    },
    med: {
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
    }),
    require('tailwindcss-elevation')(['hover']),
  ],
}
