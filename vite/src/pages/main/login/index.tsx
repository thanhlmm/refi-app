import React from "react";
import { Button } from "@zendeskgarden/react-buttons";
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
import {
  Field,
  Label,
  Hint,
  Input,
  FileUpload,
} from "@zendeskgarden/react-forms";
import { toBase64 } from "@/utils/common";

const LoginPage: React.FC = () => {
  const ignoreBackgdropEvent = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    const fileBase64 = await toBase64(acceptedFiles[0]);
    console.log(fileBase64);
    window.send("fs.init", { file: fileBase64, foo: "bar" });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ["application/json"],
    onDrop,
    multiple: false,
  });

  const error = (
    <Notification type="error">
    <Title>Error</Title>
      Celery quandong swiss chard chicory earthnut pea potato. Salsify taro
      catsear garlic
      <Close aria-label="Close Alert" />
    </Notification>
  );

  return (
    <div>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <Button>Button</Button>
      <Modal
        isAnimated={false}
        isLarge
        focusOnMount
        backdropProps={{ onClick: ignoreBackgdropEvent }}
      >
        <Header>Choose your project</Header>
        <Body>
          <Well>
            <Title>What is a Garden?</Title>
            Turnip greens yarrow endive cauliflower sea lettuce kohlrabi
            amaranth water
          </Well>
          <FileUpload {...getRootProps()} isDragging={isDragActive}>
            {isDragActive ? (
              <span>Drop files here</span>
            ) : (
              <span>Choose a file or drag and drop here</span>
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
