const path = require('path');
const { chromium } = require(path.join(__dirname, 'frontend', 'node_modules', 'playwright'));
const fs = require('fs');

async function run() {
  console.log('Starting Playwright E2E UI verification for Phase 12 - Groups...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });

  const artifactDir = 'C:\\Users\\Nitin\\.gemini\\antigravity-ide\\brain\\8f5e781c-3590-4b81-a914-e4ee8bb8c100';

  try {
    // -------------------------------------------------------------
    // CONTEXT 1: Alice (Admin)
    // -------------------------------------------------------------
    const aliceContext = await browser.newContext();
    const alicePage = await aliceContext.newPage();

    console.log('1. Alice navigates to /login...');
    await alicePage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

    // Switch to Password login mode
    await alicePage.click('text="Use Password"');
    await alicePage.fill('input[placeholder*="alice"]', 'alice');
    await alicePage.fill('input[type="password"]', 'password123');
    await alicePage.click('button[type="submit"]');

    // Wait for redirect to /chats
    await alicePage.waitForURL('**/chats**', { timeout: 10000 });
    console.log('✓ Alice logged in and at /chats');

    // Open New Group Modal
    console.log('2. Alice clicks New Group button...');
    await alicePage.waitForSelector('#new-group-modal-btn', { timeout: 5000 });
    await alicePage.click('#new-group-modal-btn');

    // Modal open
    await alicePage.waitForSelector('#new-group-name', { timeout: 5000 });
    console.log('✓ New Group modal opened');

    const groupTitle = 'Signal Core Engineering 🚀';
    await alicePage.fill('#new-group-name', groupTitle);

    // Search or select Bob & Charlie
    console.log('3. Selecting Bob and Charlie in member picker...');
    // Search results are loaded; wait for buttons containing Bob and Charlie
    await alicePage.waitForTimeout(500);

    // Look for user items in the modal list
    const bobBtn = alicePage.locator('button:has-text("Bob Mehta")').first();
    await bobBtn.waitFor({ timeout: 5000 });
    await bobBtn.click();
    console.log('✓ Selected Bob Mehta');

    const charlieBtn = alicePage.locator('button:has-text("Charlie Verma"), button:has-text("charlie")').first();
    await charlieBtn.waitFor({ timeout: 5000 });
    await charlieBtn.click();
    console.log('✓ Selected Charlie Verma');

    // Verify chips
    await alicePage.waitForSelector('text=Selected (2)');
    console.log('✓ 2 members selected in chips');

    // Click Create Group
    console.log('4. Submitting group creation...');
    await alicePage.click('#create-group-btn');

    // Wait for URL to update to /chats/[id]
    await alicePage.waitForURL(/\/chats\/\d+/, { timeout: 10000 });
    const currentUrl = alicePage.url();
    const groupIdMatch = currentUrl.match(/\/chats\/(\d+)/);
    const groupId = groupIdMatch ? groupIdMatch[1] : null;
    console.log(`✓ Navigated to created group /chats/${groupId}`);

    // Wait for chat elements
    await alicePage.waitForSelector('input[placeholder*="Message"], textarea', { timeout: 5000 });

    // Send a message in the group
    console.log('5. Sending message in the group as Alice...');
    const messageInput = alicePage.locator('input[placeholder*="Message"], textarea').first();
    const testMessageText = 'Hello team! Welcome to the Signal Core Engineering group!';
    await messageInput.fill(testMessageText);
    await alicePage.keyboard.press('Enter');

    // Wait for message bubble to appear
    await alicePage.waitForSelector(`text="${testMessageText}"`, { timeout: 8000 });
    console.log('✓ Message rendered in group chat');

    // Open Group Info Panel
    console.log('6. Opening Group Info panel...');
    await alicePage.click('#group-info-btn');
    await alicePage.waitForSelector('#group-info-panel', { timeout: 5000 });
    console.log('✓ Group Info panel opened');

    // Verify Alice sees admin view with remove buttons
    const removeButtons = alicePage.locator('button[id^="remove-member-"]');
    const removeCount = await removeButtons.count();
    console.log(`✓ Alice sees ${removeCount} remove member button(s) (expected for Bob & Charlie)`);
    if (removeCount === 0) {
      throw new Error('Admin (Alice) should see remove member buttons!');
    }

    const adminScreenshotPath = path.join(artifactDir, 'admin_group_view.png');
    await alicePage.screenshot({ path: adminScreenshotPath });
    console.log(`✓ Saved admin screenshot to ${adminScreenshotPath}`);

    // -------------------------------------------------------------
    // CONTEXT 2: Bob (Non-Admin Member)
    // -------------------------------------------------------------
    console.log('\n7. Bob logs in to verify non-admin permissions & live message...');
    const bobContext = await browser.newContext();
    const bobPage = await bobContext.newPage();

    await bobPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await bobPage.click('text="Use Password"');
    await bobPage.fill('input[placeholder*="alice"]', 'bob');
    await bobPage.fill('input[type="password"]', 'password123');
    await bobPage.click('button[type="submit"]');

    await bobPage.waitForURL('**/chats**', { timeout: 10000 });
    console.log('✓ Bob logged in');

    // Navigate to the created group
    await bobPage.goto(`http://localhost:3000/chats/${groupId}`, { waitUntil: 'networkidle' });

    // Verify Bob sees the message
    await bobPage.waitForSelector(`text="${testMessageText}"`, { timeout: 8000 });
    console.log('✓ Bob sees Alice\'s group message live in the chat!');

    // Bob opens Group Info panel
    console.log('8. Bob opens Group Info panel...');
    await bobPage.click('#group-info-btn');
    await bobPage.waitForSelector('#group-info-panel', { timeout: 5000 });

    // Verify Bob (non-admin) CANNOT see any remove buttons
    const bobRemoveButtons = bobPage.locator('button[id^="remove-member-"]');
    const bobRemoveCount = await bobRemoveButtons.count();
    console.log(`✓ Bob sees ${bobRemoveCount} remove member button(s) (expected 0)`);
    if (bobRemoveCount !== 0) {
      throw new Error(`Non-admin (Bob) should NOT see remove buttons, found ${bobRemoveCount}!`);
    }

    const memberScreenshotPath = path.join(artifactDir, 'member_group_view.png');
    await bobPage.screenshot({ path: memberScreenshotPath });
    console.log(`✓ Saved non-admin screenshot to ${memberScreenshotPath}`);

    console.log('\n🎉 ALL E2E GROUP UI TESTS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
