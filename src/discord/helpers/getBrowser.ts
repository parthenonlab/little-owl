import puppeteer, { Browser } from 'puppeteer';

/**
 * Launch a Puppeteer browser, run a task, then close the browser.
 *
 * @param task - Async function that receives the browser instance and returns a result.
 * @returns The result of the task.
 */
export async function useBrowser<T>(task: (browser: Browser) => Promise<T>) {
  const browser = await puppeteer.launch({
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
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-breakpad',
      '--disable-default-apps',
      '--disable-sync',
      '--metrics-recording-only',
      '--mute-audio',
    ],
  });

  try {
    return await task(browser);
  } finally {
    await browser.close();
  }
}
