import {
  actionAddPathExpander,
  actionImportDocs,
} from "@/atoms/firestore.action";
import { navigatorCollectionPathAtom } from "@/atoms/navigator";
import { actionPathExpand } from "@/atoms/navigator.action";
import {
  importCollectionPathAtom,
  importFileAtom,
  isImportModalAtom,
} from "@/atoms/ui";
import { notifyErrorPromise } from "@/atoms/ui.action";
import {
  getParentPath,
  ignoreBackdropEvent,
  isCollection,
  readerFilePromise,
} from "@/utils/common";
import { Button } from "@zendeskgarden/react-buttons";
import {
  Checkbox,
  Field,
  FileUpload,
  Input,
  Label,
  Message,
} from "@zendeskgarden/react-forms";
import {
  Body,
  Footer,
  FooterItem,
  Header,
  Modal,
} from "@zendeskgarden/react-modals";
import csvtojson from "csvtojson";
import React, { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import SelectComboBox from "../SelectComboBox";

const ImportModal = () => {
  const collectionPath = useRecoilValue(importCollectionPathAtom);
  const [file, setFile] = useRecoilState(importFileAtom);
  const [docs, setDocs] = useState<any[]>([]);
  const { register, handleSubmit, formState, watch, errors, control } = useForm(
    {
      mode: "onChange",
      defaultValues: {
        path: collectionPath,
      },
    }
  );

  useEffect(() => {
    register("autoId" as any, {});
    register("idField" as any, {});
  }, []);

  const isAutoId = watch("autoId");
  const selectedIdField = watch("idField");

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ["application/json", "text/comma-separated-values", "text/csv"],
    onDrop,
    multiple: false,
  });

  const setShowImportModal = useSetRecoilState(isImportModalAtom);

  const onSubmit = (value: any) => {
    actionImportDocs(value.path, docs, {
      idField: value.isAutoId ? null : value.idField,
      autoParseJSON: value.autoParseJSON,
    })
      .then(() => {
        setFile(undefined);
        setShowImportModal(false);
        actionAddPathExpander([value.path]); // Assume that imported success we will also have new path
      })
      .catch(notifyErrorPromise);
  };

  const parseJSONDocFile = (data: string): any[] => {
    const fileData = JSON.parse(data);
    return Array.isArray(fileData) ? fileData : [fileData];
  };

  const parseCSVDocFile = (data: string): Promise<any[]> => {
    return new Promise((resolve) => {
      csvtojson().fromString(data).then(resolve);
    });
  };

  useEffect(() => {
    // TODO: Migrate me to worker to reduce the UI thread workload
    if (file) {
      readerFilePromise(file).then((fileData) => {
        if (file.type.indexOf("csv") >= 0) {
          parseCSVDocFile(fileData).then(setDocs);
        } else {
          setDocs(parseJSONDocFile(fileData));
        }
      });
    } else {
      setDocs([]);
    }
  }, [file]);

  const handleOnCancel = () => {
    setShowImportModal(false);
    setFile(undefined);
  };

  const fileType = useMemo(() => {
    if (file) {
      if (file.type.indexOf("csv") >= 0) {
        return "csv";
      }
      return "json";
    }

    return "";
  }, [file]);

  const idField = useMemo(() => {
    if (fileType && !isAutoId && docs[0]) {
      if (fileType === "csv") {
        const sampleColumn = Object.keys(docs[0]);
        return (
          <Field>
            <Label>Id field</Label>
            <Controller
              control={control}
              name="idField"
              defaultValue="__id__"
              render={({ onChange, value, ref }) => (
                <SelectComboBox
                  className="mt-2"
                  items={sampleColumn}
                  selectedItem={value}
                  handleSelectedItemChange={onChange}
                />
              )}
            />
          </Field>
        );
      }
      return (
        <Field>
          <Label>Id field</Label>
          <Input
            isCompact
            name="idField"
            defaultValue="__id__"
            ref={register}
          />
        </Field>
      );
    }

    return null;
  }, [fileType, isAutoId, docs, control]);

  // TODO: Path picker, validate path
  // TODO: Add analysis like: Preview import file, how many docs will be imported, warning if it not match current collection schema

  return (
    <Modal
      isAnimated={false}
      isLarge
      focusOnMount
      backdropProps={{ onClick: ignoreBackdropEvent }}
      appendToNode={document.querySelector("#root") || undefined}
      className="w-3/5"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Header>Import data</Header>
        <Body className="p-4">
          <div className="space-y-4 h-96">
            <Field>
              <Label>Path</Label>
              <Controller
                control={control}
                name="path"
                defaultValue={collectionPath}
                rules={{
                  validate: (value) =>
                    isCollection(value) || "It must be collection path",
                  required: true,
                }}
                render={({ onChange, value, ref }, { invalid }) => (
                  <Input
                    isCompact
                    value={value}
                    validation={invalid ? "error" : "success"}
                    onChange={(e) => onChange(e.target.value)}
                    ref={ref}
                  />
                )}
              />
              {errors.path && (
                <Message validation="error">{errors.path.message}</Message>
              )}
            </Field>
            <Field>
              <FileUpload {...getRootProps()} isDragging={isDragActive}>
                {isDragActive ? (
                  <span>Drop JSON/CSV file here</span>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    {file ? (
                      file.name
                    ) : (
                      <span>Choose a JSON/CSV file to import</span>
                    )}
                  </div>
                )}
                <Input {...getInputProps()} />
              </FileUpload>
            </Field>
            <Field>
              <Controller
                control={control}
                name="autoId"
                defaultValue={true}
                render={({ onChange, value, ref }) => (
                  <Checkbox
                    ref={ref}
                    checked={value}
                    onChange={() => onChange(!value)}
                  >
                    <Label>Auto generate ID</Label>
                  </Checkbox>
                )}
              />
            </Field>
            {idField}
            {fileType === "csv" && (
              <Field>
                <Controller
                  control={control}
                  name="autoParseJSON"
                  defaultValue={true}
                  render={({ onChange, value, ref }) => (
                    <Checkbox
                      ref={ref}
                      checked={value}
                      onChange={() => onChange(!value)}
                    >
                      <Label>Auto parse JSON value</Label>
                    </Checkbox>
                  )}
                />
              </Field>
            )}
          </div>
        </Body>
        <Footer className="p-4">
          <FooterItem>
            <Button size="small" onClick={() => handleOnCancel()}>
              Cancel
            </Button>
          </FooterItem>
          <FooterItem>
            <Button
              size="small"
              disabled={!formState.isValid || docs.length <= 0}
              isPrimary
              type="submit"
            >
              Import {docs.length > 0 && `${docs.length} doc(s)`}
            </Button>
          </FooterItem>
        </Footer>
      </form>
    </Modal>
  );
};

export default ImportModal;
