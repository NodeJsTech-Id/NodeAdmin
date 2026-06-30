# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Profile >> update profile sukses → redirect dashboard + toast sukses
- Location: tests/e2e/profile.spec.ts:19:7

# Error details

```
Error: browserType.launch: 
╔══════════════════════════════════════════════════════╗
║ Host system is missing dependencies to run browsers. ║
║ Please install them with the following command:      ║
║                                                      ║
║     sudo npx playwright install-deps                 ║
║                                                      ║
║ Alternatively, use apt:                              ║
║     sudo apt-get install libavif16\                  ║
║         libwoff1                                     ║
║                                                      ║
║ <3 Playwright Team                                   ║
╚══════════════════════════════════════════════════════╝
```