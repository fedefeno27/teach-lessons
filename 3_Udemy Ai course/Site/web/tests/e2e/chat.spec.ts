import { test, expect } from "@playwright/test";

test("chat shows a mocked reply", async ({ page }) => {
  await page.route("**/api/chat", (route) =>
    route.fulfill({ status: 200, contentType: "text/plain; charset=utf-8", body: "Mocked twin reply." }),
  );

  await page.goto("/");
  await page.getByRole("button", { name: "Chat with Federico's digital twin" }).click();
  const dialog = page.getByRole("dialog", { name: "Digital twin chat" });
  await dialog.getByLabel("Your question").fill("Hello?");
  await dialog.getByRole("button", { name: /Send/ }).click();

  await expect(dialog.getByText("Mocked twin reply.")).toBeVisible();
});
