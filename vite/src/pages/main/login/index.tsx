import React, { useEffect, useMemo, useState } from "react";
import { Anchor, Button } from "@zendeskgarden/react-buttons";
import {
  Modal,
  Header,
  Body,
  Footer,
  FooterItem,
  Close,
} from "@zendeskgarden/react-modals";
import { Well, Title, Notification } from "@zendeskgarden/react-notifications";
import { useDropzone } from "react-dropzone";
import { Input, FileUpload } from "@zendeskgarden/react-forms";
import { ignoreBackdropEvent, toBase64 } from "@/utils/common";
import { useSetRecoilState, useRecoilValueLoadable } from "recoil";
import { certs, certsQueryID } from "@/atoms/cert";
import { useHistory } from "react-router-dom";

const LoginPage: React.FC = () => {
  const userCertsLoadable = useRecoilValueLoadable(certs);
  const reloadCerts = useSetRecoilState(certsQueryID);
  const [notificationError, setNotificationError] = useState<string>("");
  const [showConfirm, setConfirm] = useState<string>("");
  const history = useHistory();

  useEffect(() => {
    if (notificationError) {
      setTimeout(() => {
        setNotificationError("");
      }, 1500);
    }
  }, [notificationError]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length <= 0) {
      setNotificationError("Invalid file");
      return;
    }

    const fileBase64 = await toBase64(acceptedFiles[0]);
    window
      .send("cert.storeKey", { file: fileBase64, foo: "bar" })
      .then(() => {
        reloadCerts((val) => val + 1);
      })
      .catch((error: Error) => {
        setNotificationError(error.message);
      });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ["application/json"],
    onDrop,
    multiple: false,
  });

  const ErrorNotify = (
    <Notification type="error" style={{ zIndex: 500 }} className="w-50">
      <Title>Error</Title>
      {notificationError}
    </Notification>
  );

  const handleOpenConnection = (projectId: string) => {
    history.push(`/${projectId}`);
  };

  const handleDeleteCert = (projectId: string) => {
    window
      .send("cert.removeKey", { projectId })
      .then(() => {
        reloadCerts((val) => val + 1);
      })
      .catch((error: Error) => {
        console.log(error);
        setNotificationError(error.message);
      })
      .then(() => setConfirm(""));
  };

  const listCerts = useMemo(() => {
    if (userCertsLoadable.state === "hasValue") {
      return userCertsLoadable.contents.map((cert) => (
        <div
          key={cert.projectId}
          onDoubleClick={() => handleOpenConnection(cert.projectId)}
          className="flex flex-row items-center justify-between p-3 border border-gray-300 rounded cursor-pointer"
        >
          <Title>{cert.projectId}</Title>
          {/* TODO: Last access time */}
          <div className="flex flex-row items-center space-x-2">
            <Button
              isPrimary
              onClick={() => handleOpenConnection(cert.projectId)}
              size="small"
            >
              Connect
            </Button>
            <button
              role="button"
              className="w-6 h-6 p-1"
              onClick={() => setConfirm(cert.projectId)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      ));
    }
  }, [userCertsLoadable.contents]);

  return (
    <div>
      <div className="relative">
        <div className="absolute w-96 top-4 right-4">
          {notificationError && ErrorNotify}
        </div>
      </div>
      <Modal
        isAnimated={false}
        isLarge
        focusOnMount
        backdropProps={{ onClick: ignoreBackdropEvent }}
        appendToNode={document.querySelector("#root") || undefined}
      >
        <Header>Choose your project</Header>
        <Body>
          <div className="space-y-3">
            {listCerts}
            <FileUpload {...getRootProps()} isDragging={isDragActive}>
              {isDragActive ? (
                <span>Drop files here</span>
              ) : (
                <span>Choose a credential file or drag and drop here</span>
              )}
              <Input {...getInputProps()} />
            </FileUpload>
            <div>
              <Anchor href="https://cuthanh.com" className="pt-2 text-sm">
                I don&apos;t know how to get credential file
              </Anchor>
            </div>
          </div>
        </Body>
      </Modal>

      {showConfirm && (
        <Modal
          onClose={() => setConfirm("")}
          isAnimated={false}
          appendToNode={document.querySelector("#root") || undefined}
        >
          <Header>Remove project {showConfirm}</Header>
          <Body>
            Remove this project will erase all its settings and credential
          </Body>
          <Footer>
            <FooterItem>
              <Button onClick={() => setConfirm("")} isBasic>
                Cancel
              </Button>
            </FooterItem>
            <FooterItem>
              <Button
                isPrimary
                isDanger
                onClick={() => handleDeleteCert(showConfirm)}
              >
                Remove
              </Button>
            </FooterItem>
          </Footer>
        </Modal>
      )}
    </div>
  );
};

export default LoginPage;
