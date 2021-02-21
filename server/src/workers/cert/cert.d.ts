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

  interface IService {
    storeKey(params: IStoreKey): Promise<boolean>;
  }
}