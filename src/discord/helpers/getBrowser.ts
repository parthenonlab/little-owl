import puppeteer, { Browser } from 'puppeteer';

const BROWSER_ARGS = [
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
];

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance?.connected) return browserInstance;

  browserInstance = await puppeteer.launch({
    executablePath: process.env.STAGING
      ? undefined
      : '/usr/lib/chromium/chromium',
    headless: true,
    pipe: true,
    args: BROWSER_ARGS,
  });

  browserInstance.on('disconnected', () => {
    browserInstance = null;
  });

  return browserInstance;
}

/**
 * Run a task using the shared Puppeteer browser instance.
 *
 * The browser is created on first use and reused across calls.
 * It is automatically relaunched if it disconnects unexpectedly.
 *
 * @param task - Async function that receives the browser instance and returns a result.
 * @returns The result of the task.
 */
export async function useBrowser<T>(task: (browser: Browser) => Promise<T>) {
  const browser = await getBrowser();
  return task(browser);
}

export async function closeBrowser() {
  await browserInstance?.close();
  browserInstance = null;
}
