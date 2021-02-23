import { IDocRef } from "firestore-serializers";
import { DocRef } from "firestore-serializers/src/DocRef";
import { NSFireStore } from "./FS";

export class DocSnapshot implements NSFireStore.IDocSnapshot {
  readonly id: string;
  private objectData: any;
  public exists = true;
  readonly ref: IDocRef;
  private changedField: string[] = [];

  static transformFromFirebase(
    docs: firebase.firestore.DocumentSnapshot[]
  ): DocSnapshot[] {
    return docs.map(
      (doc) => new DocSnapshot(doc.data(), doc.id, `/${doc.ref.path}`)
    );
  }

  constructor(data: any, id: string, path: string) {
    this.id = id;
    this.objectData = data;
    this.ref = new DocRef(path);
  }

  public data(): any {
    return this.objectData;
  }

  public changedFields(): string[] {
    return this.changedField;
  }

  public addChange(field: string): void {
    this.changedField.push(field);
  }
}
