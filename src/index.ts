import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ScraperController } from './controllers/scraper.controller';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
const scraperController = new ScraperController();
app.get('/shopee', (req, res) => scraperController.getProductDetails(req, res));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    status: 500
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 