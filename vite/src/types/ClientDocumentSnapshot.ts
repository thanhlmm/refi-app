import { DocumentData, DocumentSnapshot, IDocRef } from "firestore-serializers";
import { DocRef } from "firestore-serializers/src/DocRef";

export class ClientDocumentSnapshot {
  readonly id: string;
  private objectData: DocumentData;
  public exists = true;
  readonly ref: IDocRef;
  private changedField: string[] = [];

  static transformFromFirebase(
    docs: DocumentSnapshot[]
  ): ClientDocumentSnapshot[] {
    return docs.map(
      (doc) =>
        new ClientDocumentSnapshot(doc.data() || {}, doc.id, `/${doc.ref.path}`)
    );
  }

  constructor(data: DocumentData, id: string, path: string) {
    this.id = id;
    this.objectData = data;
    this.ref = new DocRef(path);
  }

  public data(): DocumentData {
    return this.objectData;
  }

  public changedFields(): string[] {
    return this.changedField;
  }

  public addChange(fields: string[]): void {
    this.changedField = [...this.changedField, ...fields];
  }

  public isChanged(): boolean {
    return this.changedField.length > 0;
  }
}
