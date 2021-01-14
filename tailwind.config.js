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
      gray: colors.coolGray,
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
        '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', 'sans-serif'
      ],
      'mono': [
        'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier', 'monospace'
      ]
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
    textSizes: false
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['active'],
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-fluid')({
      textSizes: {
        sm: {
          min: '14px',
          max: '18px',
          minvw: '320px',
          maxvw: '1400px'
        },
        md: {
          min: '16px',
          max: '22px',
          minvw: '320px',
          maxvw: '1400px'
        },
        lg: {
          min: '18px',
          max: '26px',
          minvw: '320px',
          maxvw: '1400px'
        },
        xl: {
          min: '20px',
          max: '26px',
          minvw: '320px',
          maxvw: '1400px'
        }
      }
    })
  ],
}

