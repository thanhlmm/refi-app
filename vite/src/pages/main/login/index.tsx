import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@zendeskgarden/react-buttons";
import {
  Modal,
  Header,
  Body,
  Footer,
  FooterItem,
} from "@zendeskgarden/react-modals";
import { Well, Title, Notification } from "@zendeskgarden/react-notifications";
import { useDropzone } from "react-dropzone";
import { Input, FileUpload } from "@zendeskgarden/react-forms";
import { toBase64 } from "@/utils/common";
import { useSetRecoilState, useRecoilValueLoadable } from "recoil";
import { certs, certsQueryID } from "@/atoms/cert";
import { useHistory } from "react-router-dom";

const LoginPage: React.FC = () => {
  const userCertsLoadable = useRecoilValueLoadable(certs);
  const reloadCerts = useSetRecoilState(certsQueryID);
  const [notificationError, setNotificationError] = useState<string>("");
  const history = useHistory();
  const ignoreBackgdropEvent = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
  };

  useEffect(() => {
    if (notificationError) {
      setTimeout(() => {
        setNotificationError("");
      }, 500);
    }
  }, [notificationError]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length <= 0) {
      setNotificationError("Invalid file");
      return;
    }

    const fileBase64 = await toBase64(acceptedFiles[0]);
    window.send("cert.storeKey", { file: fileBase64, foo: "bar" }).then(() => {
      reloadCerts((val) => val + 1);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ["application/json"],
    onDrop,
    multiple: false,
  });

  const ErrorNotify = (
    <Notification type="error">
      <Title>Error</Title>
      {notificationError}
    </Notification>
  );

  const handleOpenConnection = (projectId: string) => {
    history.push(`/${projectId}`);
  };

  const listCerts = useMemo(() => {
    if (userCertsLoadable.state === "hasValue") {
      console.log(userCertsLoadable.contents);

      return userCertsLoadable.contents.map((cert) => (
        <Well
          key={cert.projectId}
          onDoubleClick={() => handleOpenConnection(cert.projectId)}
          className="cursor-pointer"
        >
          <Title>{cert.projectId}</Title>
          Lorem ipsum
        </Well>
      ));
    }
  }, [userCertsLoadable.contents]);

  return (
    <div>
      {notificationError && ErrorNotify}
      <Modal
        isAnimated={false}
        isLarge
        focusOnMount
        backdropProps={{ onClick: ignoreBackgdropEvent }}
      >
        <Header>Choose your project</Header>
        <Body>
          {listCerts}
          <FileUpload {...getRootProps()} isDragging={isDragActive}>
            {isDragActive ? (
              <span>Drop files here</span>
            ) : (
              <span>Choose a certificate file or drag and drop here</span>
            )}
            <Input {...getInputProps()} />
          </FileUpload>
        </Body>
        <Footer>
          <FooterItem>
            <Button size="small">Cancel</Button>
          </FooterItem>
          <FooterItem>
            <Button size="small" isPrimary>
              Confirm
            </Button>
          </FooterItem>
        </Footer>
      </Modal>
    </div>
  );
};

export default LoginPage;
