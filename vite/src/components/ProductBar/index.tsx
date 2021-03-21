import { isModalFeedbackAtom, isModalNewsAtom } from "@/atoms/ui";
import { Button, IconButton } from "@zendeskgarden/react-buttons";
import { Field, Label, Textarea } from "@zendeskgarden/react-forms";
import {
  Body,
  Footer,
  FooterItem,
  Header,
  Modal,
} from "@zendeskgarden/react-modals";
import React, { ReactElement, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRecoilState } from "recoil";
import classNames from "classnames";
import firebase from "firebase/app";

const ProductBar = (): ReactElement => {
  const [isShowNews, setShowNews] = useRecoilState(isModalNewsAtom);
  const [isShowFeedback, setShowFeedback] = useRecoilState(isModalFeedbackAtom);
  const { register, handleSubmit, setValue, watch } = useForm();
  useEffect(() => {
    register("emotion", { required: true });
  }, []);

  const onSubmit = (value) => {
    // TODO: Integrate with user id
    firebase
      .firestore()
      .collection("feedbacks")
      .add(value)
      .then(() => {
        // TODO: Show a love messages
        setShowFeedback(false);
      })
      .catch((error) => {
        console.log(error);
        // TODO: Handle error
      });
  };

  const emotion = watch("emotion");

  const handleChooseEmotion = (type: "happy" | "bad") => {
    setValue("emotion", type, { shouldValidate: true });

    switch (type) {
      case "happy":
        setValue(
          "feedback",
          `Which job make your happy?\n\n\n\nWhich feature would bring you more joy?\n\n\n\n`
        );
        break;
      case "bad":
        setValue(
          "feedback",
          `Which job make you disappointed?\n\n\n\nHow should we improve it?\n\n\n\n`
        );
        break;
    }
  };

  return (
    <>
      <div className="flex flex-row items-center space-x-2 text-sm">
        <button
          onClick={() => setShowNews(true)}
          className="p-1 hover:bg-gray-500"
        >
          🔥 What&apos;s new
        </button>
        <button
          onClick={() => setShowFeedback(true)}
          className="p-1 hover:bg-gray-500"
        >
          Feedback
        </button>
      </div>
      {isShowNews && (
        <Modal
          isLarge
          focusOnMount
          isAnimated={false}
          backdropProps={{ onClick: () => setShowNews(false) }}
          className="w-10/12 h-5/6"
        >
          <Header>🔥 What&apos;s new </Header>
          <Body className="p-2">
            {/* // TODO: Add user_id to the url */}
            <iframe
              src="https://reficlient.web.app/"
              className="w-full h-full"
            />
          </Body>
        </Modal>
      )}

      {isShowFeedback && (
        <Modal
          focusOnMount
          isAnimated={false}
          backdropProps={{ onClick: () => setShowFeedback(false) }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Body className="p-4 space-y-2">
              <Field>
                <Label>How was your experience?</Label>
                <div className="space-x-3">
                  <button
                    className={classNames(
                      "text-lg rounded w-8 h-8 outline-none pr-1",
                      {
                        ["bg-gray-300"]: emotion === "happy",
                      }
                    )}
                    type="button"
                    role="button"
                    onClick={() => {
                      handleChooseEmotion("happy");
                    }}
                  >
                    <span>😉</span>
                  </button>

                  <button
                    className={classNames(
                      "text-lg rounded w-8 h-8 outline-none pr-1",
                      {
                        ["bg-gray-300"]: emotion === "bad",
                      }
                    )}
                    type="button"
                    role="button"
                    onClick={(e) => {
                      handleChooseEmotion("bad");
                    }}
                  >
                    <span>😖</span>
                  </button>
                </div>
              </Field>
              <Field>
                <Label>Tell us why? Which way should we improve that?</Label>
                <Textarea
                  minRows={4}
                  name="feedback"
                  ref={register}
                  required
                ></Textarea>
              </Field>
            </Body>
            <Footer className="p-4">
              <FooterItem>
                <Button size="small" onClick={() => setShowFeedback(false)}>
                  Cancel
                </Button>
              </FooterItem>
              <FooterItem>
                <Button size="small" type="submit" isPrimary>
                  Send
                </Button>
              </FooterItem>
            </Footer>
          </form>
        </Modal>
      )}
    </>
  );
};

export default ProductBar;
