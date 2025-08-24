/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    theme: { extend: {} },
    plugins: [require('daisyui')],
    daisyui: {
      themes: [
        {
          sens: {
            // palette from site
            primary: '#6C6D6F',            // gray
            'primary-content': '#FFFFFF',
  
            secondary: '#EBD8BA',          // tan
            'secondary-content': '#1F2937',
  
            accent: '#BFA888',             // darker tan
            'accent-content': '#1F2937',
  
            neutral: '#4B4D50',            // darker neutral for text/icons
            'neutral-content': '#FFFFFF',
  
            // backgrounds & borders
            'base-100': '#FFFFFF',         // page bg
            'base-200': '#FAF7F2',         // subtle section bg (warm white)
            'base-300': '#EDE7DE',         // borders / dividers
  
            info: '#6BA6D6',
            success: '#63C093',
            warning: '#E9B949',
            error: '#E76E6E',
          },
        },
        'light',
      ],
    },
  };
  