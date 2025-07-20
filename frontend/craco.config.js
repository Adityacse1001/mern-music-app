module.exports = {
  style: {
    postcss: { // Corrected to "postcss"
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  devServer: {
    historyApiFallback: true, // Ensures SPA routing
  },
};