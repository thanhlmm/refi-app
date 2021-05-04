import { recoilPersist } from "recoil-custom-persist";
const projectPersistAtom = recoilPersist({ key: () => window.projectId });

const { persistAtom: userPersistAtom } = recoilPersist({
  key: "user-settings",
})();

// Project settings
export default projectPersistAtom;

// User settings
export { userPersistAtom };
