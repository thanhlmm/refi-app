declare namespace NSCert {
  interface IStoreKey {
    file: string;
  }

  interface ICertificate {
    type: string;
    project_id: string;
    client_id: string;
    client_email: string;
  }

  interface ICertificateData {
    projectId: string;
    keyPath: string;
  }

  interface IRemoveKey {
    projectId: string;
  }

  interface IService {
    storeKey(params: IStoreKey): Promise<boolean>;
    getKeys(): Promise<ICertificateData[]>;
    removeKey(params: IRemoveKey): Promise<boolean>;
  }
}