import { chromium } from "playwright";

async function runLiveTour() {
  console.log("🚀 Launching automated Chromium browser in visible/interactive mode...");
  const browser = await chromium.launch({
    headless: false,
    slowMo: 600, // Slow down operations so human eye can watch the cursor/actions
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });
  const page = await context.newPage();

  try {
    // 1. Visit Homepage
    console.log("📍 Visiting Homepage (http://localhost:8080)...");
    await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "test-results/1_homepage.png" });

    // 2. Click Courses Nav
    console.log("📍 Navigating to Courses...");
    await page.click('header nav a[href="/courses"]');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "test-results/2_courses.png" });

    // 3. Click Quest Map
    console.log("📍 Navigating to Multi-Track Quest Map...");
    await page.click('header nav a[href="/map"]');
    await page.waitForTimeout(1200);

    // Switch Track on Map to HTML
    console.log("👉 Switching Quest Map to HTML Track...");
    await page.click('button:has-text("HTML")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "test-results/3_map_html.png" });

    // Switch Track on Map to C++
    console.log("👉 Switching Quest Map to C++ Track...");
    await page.click('button:has-text("C++")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "test-results/4_map_cpp.png" });

    // 4. Navigate to Interactive Lesson
    console.log("📍 Entering Interactive Coding Lesson...");
    await page.goto("http://localhost:8080/lesson", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Click "Run Code" in Monaco Editor
    console.log("👉 Executing Python code in browser via Pyodide WebAssembly...");
    await page.click('button:has-text("Run Code")');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: "test-results/5_lesson_python_run.png" });

    // Submit Solution and trigger Confetti
    console.log("👉 Submitting Solution to trigger XP & Confetti...");
    await page.click('button:has-text("Submit Solution")');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: "test-results/6_lesson_passed_confetti.png" });

    // Switch to HTML Live Preview Track
    console.log("👉 Switching Lesson to HTML Live Web Sandbox...");
    await page.click('button:has-text("HTML")');
    await page.waitForTimeout(1500);
    await page.click('button:has-text("Run Code")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "test-results/7_lesson_html_preview.png" });

    // 5. Navigate to Daily Battle
    console.log("📍 Entering Daily Battle vs Boss...");
    await page.click('header nav a[href="/battle"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "test-results/8_daily_battle.png" });

    // 6. Navigate to Leaderboard
    console.log("📍 Checking Global Live Leaderboard...");
    await page.click('header nav a[href="/leaderboard"]');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "test-results/9_leaderboard.png" });

    // 7. Navigate to Pricing
    console.log("📍 Visiting Pricing Tiers...");
    await page.click('header nav a[href="/pricing"]');
    await page.waitForTimeout(1200);

    // Toggle Yearly discount
    console.log("👉 Toggling Yearly Discount switch...");
    await page.click('button:has-text("Yearly")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "test-results/10_pricing_yearly.png" });

    // 8. Visit Sign in / Registration
    console.log("📍 Visiting Auth Page...");
    await page.click('header a[href="/auth"]');
    await page.waitForTimeout(1200);

    // Test Forgot Password Switch
    console.log("👉 Testing Forgot Password interaction...");
    await page.click('button:has-text("Forgot password?")');
    await page.waitForTimeout(800);
    await page.screenshot({ path: "test-results/11_auth_forgot_password.png" });

    console.log("✅ All interactive live tests completed successfully!");
  } catch (error) {
    console.error("❌ Test error:", error);
  } finally {
    await browser.close();
  }
}

runLiveTour();
