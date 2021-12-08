const { notarize } = require('electron-notarize');

async function packageTask() {
  const appPath = './RefiApp.app'
  const appBundleId = "iOS.RefiApp.desktop";
  const appleId = "nlug27@icloud.com";
  const appleIdPassword = "vstf-tcos-enfk-jruz";

  // Package your app here, and code sign with hardened runtime
  await notarize({
    appBundleId,
    appPath,
    appleId,
    appleIdPassword,
    ascProvider: '4WDTWD675S', // This parameter is optional
  });
}

packageTask();