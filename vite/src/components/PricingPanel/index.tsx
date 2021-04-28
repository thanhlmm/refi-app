import React, { ReactElement, ReactNode } from "react";

interface IPricingPanelProps {
  plan: string;
  originalPrice: string;
  price: string;
  description: string;
  bullets: string[];
  cta: ReactNode;
  ctaAction: (e: React.MouseEvent) => void;
  isLarger?: boolean;
}

function PricingPanel({
  plan,
  originalPrice,
  price,
  description,
  bullets,
  cta,
  ctaAction,
  isLarger = false,
}: IPricingPanelProps): ReactElement {
  return (
    <div
      className={`${
        isLarger ? "w-80" : "w-64"
      } w-full max-w-sm mx-4 mt-2 border border-gray-100 rounded shadow h-120 md:w-1/3`}
    >
      <div className="px-3 py-4">
        <h2 className="text-lg font-semibold lg:text-xl">{plan}</h2>
        {originalPrice === "" ? (
          <h2 className="text-xl font-bold lg:text-2xl">{price}</h2>
        ) : (
          <h2 className="text-xl font-bold lg:text-2xl">
            <span className="pr-2 text-lg text-red-600 line-through lg:text-xl">
              {originalPrice}
            </span>
            {price}
          </h2>
        )}
        <p className="mt-4">{description}</p>
      </div>
      <div className="w-full border border-gray-100"></div>
      <h2 className="px-3 py-2 text-lg font-semibold">What&apos;s included?</h2>
      <div className="h-48 px-3">
        {bullets.map((bullet, index) => (
          <div key={index} className="py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="inline-flex w-4 mr-2 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{bullet}</span>
          </div>
        ))}
      </div>
      <button
        onClick={ctaAction}
        className="flex justify-center w-32 px-4 py-2 mx-auto my-4 font-semibold text-white rounded bg-palette-primary hover:bg-palette-dark focus:outline-none"
      >
        {cta}
      </button>
    </div>
  );
}

export default PricingPanel;
