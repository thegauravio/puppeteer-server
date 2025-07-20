const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 1. Take screenshot
app.post('/screenshot', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
    await browser.close();

    res.json({ screenshot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Extract text content from a page
app.post('/gettext', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const text = await page.evaluate(() => document.body.innerText);
    const title = await page.title();
    await browser.close();

    res.json({ title, text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Click a button or element
app.post('/click', async (req, res) => {
  const { url, selector } = req.body;
  if (!url || !selector) return res.status(400).json({ error: 'URL and selector are required' });

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.click(selector);
    const newTitle = await page.title();
    await browser.close();

    res.json({ success: true, newTitle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Search on a website (like Google)
app.post('/search', async (req, res) => {
  const { url, inputSelector, query } = req.body;
  if (!url || !inputSelector || !query) return res.status(400).json({ error: 'url, inputSelector, and query are required' });

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    await page.type(inputSelector, query);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const newTitle = await page.title();
    const resultText = await page.evaluate(() => document.body.innerText);
    await browser.close();

    res.json({ newTitle, resultText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('🧠 Web Action Agent is running!');
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
