import { atom, selector } from "recoil";

interface ICertificateData {
  projectId: string;
}

export const certsQueryID = atom({
  key: "certs_query_id",
  default: 0,
});

export const certs = selector({
  key: "certs",
  get: async ({ get }): Promise<ICertificateData[]> => {
    get(certsQueryID);
    const response = await window.send("cert.getKeys", null);
    return response;
  },
});
