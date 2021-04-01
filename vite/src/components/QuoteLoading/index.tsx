import React, { useEffect, useState } from "react";
import firebase from "firebase/app";

interface IQuote {
  detail: string;
  author: string;
  logo: string;
  url?: string;
  timeout: number;
}

interface IQuoteLoadingProps {
  onDone: () => void;
}

const QuoteLoading = ({ onDone }: IQuoteLoadingProps) => {
  const [quote, setQuote] = useState<IQuote>();
  useEffect(() => {
    firebase
      .firestore()
      .collection("quotes")
      .get()
      .then((response) => {
        const randomQuote =
          response.docs[Math.floor(Math.random() * response.docs.length)];
        setQuote(randomQuote.data() as IQuote);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, quote?.timeout || 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [quote]);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen text-center">
      <div className="animate-spin">
        <svg
          width="36"
          height="36"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className="text-gray-600"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.917 7A6.002 6.002 0 0 0 2.083 7H1.071a7.002 7.002 0 0 1 13.858 0h-1.012z"
          />
        </svg>
      </div>
      {quote && (
        <>
          <p
            className="mt-3 text-3xl italic text-gray-500 mx-72"
            dangerouslySetInnerHTML={{ __html: quote.detail }}
          />
          {quote.url && (
            <p>
              <a className="text-lg text-blue-500" href={quote.url}>
                Learn more
              </a>
            </p>
          )}
          <div className="flex flex-row items-center mt-6 -ml-6">
            <img
              className="w-12 h-12 rounded-lg"
              src={quote.logo}
              alt="author"
            />
            <div className="text-2xl">{quote.author}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuoteLoading;
