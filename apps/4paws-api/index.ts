import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/v1/animals', (req, res) => {
  res.json({ message: 'Animals endpoint - coming soon!' });
});

app.get('/api/v1/users', (req, res) => {
  res.json({ message: 'Users endpoint - coming soon!' });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 4Paws API running on port ${PORT}`);
  });
}

export default app;