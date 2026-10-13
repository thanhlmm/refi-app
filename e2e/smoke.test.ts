import { _electron as electron, expect, Page, test } from "@playwright/test";
import * as admin from "firebase-admin";
import { generateKeyPairSync } from "crypto";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const projectId = "demo-refi-e2e";
const isProjectView = (page: Page) =>
  page.url().startsWith("app://-/") && !page.url().endsWith("/tabs.html");

const serverDir = resolve(__dirname, "../server");

test("edits a document and commits it to Firestore", async () => {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  expect(emulatorHost).toBeTruthy();

  const tempDir = mkdtempSync(join(tmpdir(), "refi-e2e-"));
  const userDataDir = join(tempDir, "user-data");
  const keyPath = join(tempDir, "service-account.json");
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  writeFileSync(
    keyPath,
    JSON.stringify({
      type: "service_account",
      project_id: projectId,
      private_key_id: "e2e",
      private_key: privateKey,
      client_email: `e2e@${projectId}.iam.gserviceaccount.com`,
      client_id: "1",
    })
  );

  const app = admin.initializeApp({ projectId });
  const firestore = app.firestore();
  await firestore.doc("smoke/doc1").set({ name: "before", count: 1 });

  const electronApp = await electron.launch({
    executablePath: require("electron") as string,
    args: [`--user-data-dir=${userDataDir}`, "."],
    cwd: serverDir,
    env: { ...(process.env as Record<string, string>), ELECTRON_IS_DEV: "0" },
  });

  try {
    const actualUserData = await electronApp.evaluate(({ app }) =>
      app.getPath("userData")
    );
    if (resolve(actualUserData) !== resolve(userDataDir)) {
      await electronApp.close();
      throw new Error(
        `Refusing to continue: userData is ${actualUserData}, expected ${userDataDir}`
      );
    }

    const page =
      electronApp.windows().find(isProjectView) ??
      (await electronApp.waitForEvent("window", { predicate: isProjectView }));
    await page.locator("input[type=file]").setInputFiles(keyPath);
    const row = page.getByText(projectId, { exact: true }).locator("..");
    await row.getByRole("button", { name: "Connect" }).click();
    await page.getByRole("treeitem", { name: "smoke" }).getByText("smoke").click();
    await page.getByRole("cell", { name: "before" }).getByRole("textbox").fill("after");
    await page.getByRole("cell", { name: "after" }).getByRole("textbox").blur();
    await page.getByRole("button", { name: "Commit" }).click();

    await expect
      .poll(async () => (await firestore.doc("smoke/doc1").get()).data())
      .toEqual({ name: "after", count: 1 });
  } finally {
    await electronApp.close();
    await app.delete();
    rmSync(tempDir, { recursive: true, force: true });
  }
});
