import React, { useEffect, useMemo, useState } from "react";
import firebase from "firebase/app";
import { useLocalStorage } from "react-use";

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
  const [quotes, setQuotes] = useLocalStorage<IQuote[]>("quotes", []);
  useEffect(() => {
    firebase
      .firestore()
      .collection("quotes")
      .get()
      .then((response) => {
        setQuotes(response.docs.map((doc) => doc.data() as IQuote));
      });
  }, []);

  const quote = useMemo(() => {
    if (!quotes) {
      return undefined;
    }
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [quotes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, quote?.timeout || 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [quote]);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen text-center quote">
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
          <img
            className="w-12 h-12 mt-6 rounded-lg"
            src={quote.logo}
            alt="author"
          />
          <div className="flex flex-row items-center">
            <div className="text-2xl">{quote.author}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuoteLoading;
