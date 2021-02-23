import path from 'path';
import fs from 'fs';
import uuid from 'uuid';
import { IServiceContext } from "../service";

export default class CertService implements NSCert.IService {
  private ctx: IServiceContext;
  constructor(ctx: IServiceContext) {
    this.ctx = ctx;
  }

  static parseCertificateFile(path: string): NSCert.ICertificate {
    const certContent = fs.readFileSync(path, "utf8");
    const keyContent: NSCert.ICertificate = JSON.parse(certContent);

    return keyContent;
  }

  public async storeKey({ file }: NSCert.IStoreKey): Promise<boolean> {
    const base64data = file.split(';base64,').pop();
    // TODO: Return error if cert is already existed

    const keyPath = path.join(this.ctx.userDataPath, 'Keys', `${uuid.v4()}.json`);
    fs.writeFileSync(keyPath, base64data, { encoding: 'base64' });
    const cert = CertService.parseCertificateFile(keyPath);
    this.ctx.localDB.get('keys')
      .push({
        keyPath,
        projectId: cert.project_id
      })
      .write();

    return true;
  }

  public async getKeys(): Promise<NSCert.ICertificateData[]> {
    return this.ctx.localDB.get('keys')
      .value()
  }
}