/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        sens: {
          /* Core brand */
          primary: '#A6847B',              // muted rose (main CTAs, headings)
          'primary-focus': '#8F6E64',      // ~15% darker for hover/focus
          'primary-content': '#FFFFFF',

          secondary: '#EBD5BA',            // warm sand (secondary surfaces)
          'secondary-focus': '#DBBE95',    // darker sand for hover/focus
          'secondary-content': '#1F2937',

          accent: '#C7B49E',               // soft accent to complement the above
          'accent-focus': '#B59E84',
          'accent-content': '#1F2937',

          /* Neutrals */
          neutral: '#6C6D6F',              // slate grey for icons/labels
          'neutral-content': '#FFFFFF',

          /* Backgrounds & borders (warm, subtle) */
          'base-100': '#FFFFFF',           // page bg
          'base-200': '#FAF7F2',           // section bg
          'base-300': '#EDE7DE',           // borders

          /* Status (tasteful) */
          info: '#6BA6D6',
          success: '#63C093',
          warning: '#E9B949',
          error: '#E76E6E',

          /* Optional rounded look */
          '--rounded-box': '1rem',
          '--rounded-btn': '0.875rem',
          '--rounded-badge': '0.75rem',
        },
      },
      'light', // keep as fallback (optional)
    ],
  },
};
