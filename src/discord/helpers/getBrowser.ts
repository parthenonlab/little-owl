import puppeteer, { Browser } from 'puppeteer';

let browser: Browser | null = null;

export async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: process.env.STAGING
        ? undefined
        : '/usr/lib/chromium/chromium',
      headless: true,
      pipe: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-zygote',
        '--single-process',
      ],
    });
  }

  return browser;
}
