require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
  if (err && err instanceof Error) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
