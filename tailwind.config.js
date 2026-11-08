export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: {
      forest: { 50:'#eef6f1',100:'#d5e9dc',200:'#aed3bb',300:'#7db797',400:'#4f9874',500:'#357d5a',600:'#276447',700:'#1f503a',800:'#183f2e',900:'#102a1f' },
      charcoal: '#23282b', snow: '#f7f9f8',
    },
    fontFamily: { display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'], sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'] },
  } },
  plugins: [],
};
