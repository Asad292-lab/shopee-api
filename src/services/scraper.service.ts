import axios, { AxiosInstance } from 'axios';
import { HttpProxyAgent } from 'http-proxy-agent';
import { ScraperConfig, ShopeeApiResponse } from '../types';
import crypto from 'crypto';

export class ScraperService {
  private axiosInstance: AxiosInstance;
  private userAgents: string[] = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36'
  ];

  constructor(private config: ScraperConfig) {
    this.axiosInstance = this.createAxiosInstance();
  }

  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://shopee.tw',
        'Referer': 'https://shopee.tw/',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (this.config.proxy) {
      const agent = new HttpProxyAgent(this.config.proxy);
      instance.defaults.httpAgent = agent;
      instance.defaults.httpsAgent = agent;
    }

    return instance;
  }

  private getRandomUserAgent(): string {
    const index = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[index];
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRandomDelay(): number {
    return Math.floor(Math.random() * 2000) + 1000; // Random delay between 1-3 seconds
  }

  private generateAFSID(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const data = `${timestamp}_${random}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  private async getInitialCookies(): Promise<string> {
    try {
      const afSid = this.generateAFSID();
      const response = await axios.get('https://shopee.tw/', {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Cookie': `AF_SID=${afSid}; SPC_F=null; REC_T_ID=null; _gcl_au=1.1.${Date.now()}.${Math.floor(Math.random() * 1000000)}; __LOCALE__null=TW; _gid=GA1.2.${Math.floor(Math.random() * 1000000)}.${Date.now()}; _ga=GA1.1.${Math.floor(Math.random() * 1000000)}.${Date.now()}; _fbp=fb.1.${Date.now()}.${Math.floor(Math.random() * 1000000)}; _tt_enable_cookie=1; csrftoken=${crypto.randomBytes(32).toString('hex')}`,
        },
      });
      const cookies = response.headers['set-cookie'];
      return cookies ? cookies.join('; ') : '';
    } catch (error) {
      console.error('Failed to get initial cookies:', error);
      return '';
    }
  }

  private generateSignature(storeId: string, dealId: string, timestamp: number): string {
    const data = `${storeId}${dealId}${timestamp}${crypto.randomBytes(16).toString('hex')}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async scrapeProduct(storeId: string, dealId: string): Promise<ShopeeApiResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        // Random delay between requests
        await this.delay(this.getRandomDelay());

        // Get initial cookies
        const cookies = await this.getInitialCookies();
        
        // Rotate user agent
        const userAgent = this.getRandomUserAgent();
        this.axiosInstance.defaults.headers['User-Agent'] = userAgent;
        this.axiosInstance.defaults.headers['Cookie'] = cookies;

        // First visit the product page to get additional cookies
        const productUrl = `https://shopee.tw/product/${storeId}/${dealId}`;
        const productResponse = await this.axiosInstance.get(productUrl);
        const productCookies = productResponse.headers['set-cookie'];
        const allCookies = [...cookies.split('; '), ...(productCookies || [])].join('; ');
        this.axiosInstance.defaults.headers['Cookie'] = allCookies;

        // Generate timestamp and signature
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = this.generateSignature(storeId, dealId, timestamp);

        // Extract csrftoken from cookies
        const csrftoken = allCookies.match(/csrftoken=([^;]+)/)?.[1] || '';

        // Then make the API request
        const response = await this.axiosInstance.get(
          `https://shopee.tw/api/v4/pdp/get_pc?itemid=${dealId}&shopid=${storeId}&_ts=${timestamp}&_sig=${signature}`,
          {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'X-Shopee-Language': 'zh-Hant',
              'X-API-SOURCE': 'pc',
              'X-Csrftoken': csrftoken,
              'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              'X-Real-IP': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            }
          }
        );

        return response.data;
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        await this.delay(this.config.retryDelay * (attempt + 1));
      }
    }

    throw lastError || new Error('Failed to scrape product after all retries');
  }
} 