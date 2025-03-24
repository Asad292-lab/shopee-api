import { Request, Response } from 'express';
import { ScraperService } from '../services/scraper.service';
import { ShopeeProductRequest, ErrorResponse } from '../types';

export class ScraperController {
  private scraperService: ScraperService;

  constructor() {
    this.scraperService = new ScraperService({
      timeout: 10000,
      retries: 3,
      retryDelay: 2000,
    });
  }

  async getProductDetails(req: Request, res: Response): Promise<void> {
    try {
      const { storeId, dealId } = req.query;
      
      if (typeof storeId !== 'string' || typeof dealId !== 'string') {
        const error: ErrorResponse = {
          error: 'Bad Request',
          message: 'Missing or invalid required parameters: storeId and dealId must be strings',
          status: 400,
        };
        res.status(400).json(error);
        return;
      }

      const productData = await this.scraperService.scrapeProduct(storeId, dealId);
      res.json(productData);
    } catch (error) {
      const errorResponse: ErrorResponse = {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 500,
      };
      res.status(500).json(errorResponse);
    }
  }
} 