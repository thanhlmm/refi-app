import { isModalFeedbackAtom, isModalNewsAtom } from "@/atoms/ui";
import { Button, IconButton } from "@zendeskgarden/react-buttons";
import { Field, Input, Label, Textarea } from "@zendeskgarden/react-forms";
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
import EscExit from "../EscExit";

const ProductBar = (): ReactElement => {
  const [isShowNews, setShowNews] = useRecoilState(isModalNewsAtom);
  const [isShowFeedback, setShowFeedback] = useRecoilState(isModalFeedbackAtom);
  const { register, handleSubmit, setValue, watch, getValues } = useForm();
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

  const handleTweet = () => {
    const content = getValues().feedback;
    firebase
      .firestore()
      .collection("feedbacks")
      .add(getValues())
      .then(() => {
        console.log("Done save user feedback");
      });
    window.open(`https://twitter.com/intent/tweet?text=${encodeURI(content)}`);
  };

  return (
    <>
      <div className="flex flex-row items-center space-x-2 text-sm">
        <button
          onClick={() => setShowNews(true)}
          className="px-2 py-1 hover:bg-gray-300"
        >
          🔥 What&apos;s new
        </button>
        <button
          onClick={() => setShowFeedback(true)}
          className="px-2 py-1 hover:bg-gray-300"
        >
          Feedback
        </button>
      </div>
      {isShowNews && (
        <EscExit onExit={() => setShowNews(false)}>
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
                src="https://refi-changelog.super.site/"
                className="w-full h-full"
              />
            </Body>
          </Modal>
        </EscExit>
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
              <Field>
                <Label>
                  Your email - we will send you update when the issue is fixed
                  (Optional)
                </Label>
                <Input name="email" type="email" ref={register} />
              </Field>
              <div className="mt-8 text-xs text-gray-400">
                We ❤️ to reply you on Twitter
              </div>
            </Body>
            <Footer className="p-4 pt-0">
              <div className="space-x-3">
                <Button
                  size="small"
                  isBasic
                  onClick={() => setShowFeedback(false)}
                >
                  Cancel
                </Button>
                <Button size="small" isPrimary type="submit">
                  Send
                </Button>
                <Button size="small" isPrimary onClick={() => handleTweet()}>
                  Tweet it
                  <svg
                    className="ml-1"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                  >
                    <path d="M15 3.784a5.63 5.63 0 0 1-.65.803 6.058 6.058 0 0 1-.786.68 5.442 5.442 0 0 1 .014.377c0 .574-.061 1.141-.184 1.702a8.467 8.467 0 0 1-.534 1.627 8.444 8.444 0 0 1-1.264 2.04 7.768 7.768 0 0 1-1.72 1.521 7.835 7.835 0 0 1-2.095.95 8.524 8.524 0 0 1-2.379.329 8.178 8.178 0 0 1-2.293-.325A7.921 7.921 0 0 1 1 12.52a5.762 5.762 0 0 0 4.252-1.19 2.842 2.842 0 0 1-2.273-1.19 2.878 2.878 0 0 1-.407-.8c.091.014.181.026.27.035a2.797 2.797 0 0 0 1.022-.089 2.808 2.808 0 0 1-.926-.362 2.942 2.942 0 0 1-.728-.633 2.839 2.839 0 0 1-.65-1.822v-.033c.402.227.837.348 1.306.362a2.943 2.943 0 0 1-.936-1.04 2.955 2.955 0 0 1-.253-.649 2.945 2.945 0 0 1 .007-1.453c.063-.243.161-.474.294-.693.364.451.77.856 1.216 1.213a8.215 8.215 0 0 0 3.008 1.525 7.965 7.965 0 0 0 1.695.263 2.15 2.15 0 0 1-.058-.325 3.265 3.265 0 0 1-.017-.331c0-.397.075-.77.226-1.118a2.892 2.892 0 0 1 1.528-1.528 2.79 2.79 0 0 1 1.117-.225 2.846 2.846 0 0 1 2.099.909 5.7 5.7 0 0 0 1.818-.698 2.815 2.815 0 0 1-1.258 1.586A5.704 5.704 0 0 0 15 3.785z" />
                  </svg>
                </Button>
              </div>
            </Footer>
          </form>
        </Modal>
      )}
    </>
  );
};

export default ProductBar;
