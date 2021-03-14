import { recoilPersist } from "recoil-persist";
const { persistAtom } = recoilPersist({ key: window.projectId || "refi-app" });

const { persistAtom: userPersistAtom } = recoilPersist({
  key: "user-settings",
});

// Project settings
export default persistAtom;

// User settings
export { userPersistAtom };
