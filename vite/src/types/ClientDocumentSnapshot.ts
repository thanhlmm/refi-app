import { DocumentData, DocumentSnapshot, IDocRef } from "firestore-serializers";
import { DocRef } from "firestore-serializers/src/DocRef";
import * as immutable from "object-path-immutable";

export class ClientDocumentSnapshot {
  readonly id: string;
  private objectData: DocumentData;
  public exists = true;
  readonly ref: IDocRef;
  private changedField: string[] = [];
  queryVersion?: number;

  static transformFromFirebase(
    docs: DocumentSnapshot[],
    queryVersion?: number
  ): ClientDocumentSnapshot[] {
    return docs.map(
      (doc) =>
        new ClientDocumentSnapshot(
          doc.data() || {},
          doc.id,
          `/${doc.ref.path}`,
          queryVersion
        )
    );
  }

  public mergeNewDoc(newDoc: ClientDocumentSnapshot): ClientDocumentSnapshot {
    this.objectData = immutable.merge(newDoc.data(), "", this.objectData);
    this.queryVersion = newDoc.queryVersion;

    return this;
  }

  constructor(
    data: DocumentData,
    id: string,
    path: string,
    queryVersion?: number
  ) {
    this.id = id;
    this.objectData = data;
    this.ref = new DocRef(path);
    this.queryVersion = queryVersion;
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
