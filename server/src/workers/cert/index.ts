import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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

    const keyPath = path.join(this.ctx.userDataPath, 'Keys', `${uuidv4()}.json`);
    fs.writeFileSync(keyPath, base64data, { encoding: 'base64' });
    const cert = CertService.parseCertificateFile(keyPath);
    if (this.ctx.localDB.get('keys').find({ projectId: cert.project_id }).value()) {
      throw new Error('This key is already existed');
    }

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

  public async removeKey({ projectId }: NSCert.IRemoveKey): Promise<boolean> {
    const keys = await this.getKeys();
    try {
      const keyData = keys.find(key => key.projectId === projectId);
      if (keyData) {
        fs.unlinkSync(keyData.keyPath);
      }
    } catch (error) {
      // Ignore error
    }
    await this.ctx.localDB.get('keys').remove({ projectId }).write();
    return true;
  }
}