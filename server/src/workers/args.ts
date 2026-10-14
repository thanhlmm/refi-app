const [version, tabName, mode] = process.argv.slice(2);

export const workerArgs = { version, tabName, isDev: mode === 'dev' };
