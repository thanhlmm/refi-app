import { certs, certsQueryID } from "@/atoms/cert";
import { ignoreBackdropEvent, toBase64 } from "@/utils/common";
import { Anchor, Button } from "@zendeskgarden/react-buttons";
import { FileUpload, Input } from "@zendeskgarden/react-forms";
import {
  Body,
  Footer,
  FooterItem,
  Header,
  Modal,
} from "@zendeskgarden/react-modals";
import { Notification, Title } from "@zendeskgarden/react-notifications";
import React, { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useHistory } from "react-router-dom";
import { useRecoilValueLoadable, useSetRecoilState } from "recoil";

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
    history.push({
      pathname: `/${projectId}`,
      hash: "/",
    });
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
          className="flex flex-row items-center justify-between p-3 border border-gray-300 rounded cursor-pointer group"
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
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
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
        <Body className="p-4">
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
              <Anchor
                href="https://www.notion.so/cuthanh/How-to-get-my-credential-file-781fb9bfa0cf479a81b72a272728808c"
                className="pt-2 text-sm"
              >
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
          <Body className="p-4">
            Remove this project will erase all its settings and credential
          </Body>
          <Footer className="p-4">
            <FooterItem>
              <Button onClick={() => setConfirm("")} size="small">
                Cancel
              </Button>
            </FooterItem>
            <FooterItem>
              <Button
                isPrimary
                isDanger
                size="small"
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
