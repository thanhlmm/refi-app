import { isModalPricingAtom } from "@/atoms/ui";
import { Header, Modal, Body } from "@zendeskgarden/react-modals";
import React, { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import PricingPanel from "../PricingPanel";
import firebase from "firebase/app";

const PricingModal = () => {
  const [isOpen, setOpen] = useRecoilState(isModalPricingAtom);
  const chargeBee = useRef<any>(null);

  useEffect(() => {
    // TODO: Subscribe to event open upgrade
  }, []);

  useEffect(() => {
    window.Chargebee.init({
      site: "refiapp-test",
    });
    chargeBee.current = window.Chargebee.getInstance();
  }, []);

  const handleCheckout = (planId) => {
    if (chargeBee.current) {
      chargeBee.current.openCheckout({
        hostedPage: function () {
          // We will discuss on how to implement this end point in the next step.
          return firebase
            .functions()
            .httpsCallable("checkoutURL")({
              subscription: {
                plan_id: planId,
              },
            })
            .then((result) => result.data);
        },
        success: function (hostedPageId) {
          // success callback
        },
      });
    }
  };

  return (
    <div>
      <Modal
        isAnimated={false}
        className="w-3/4"
        focusOnMount
        backdropProps={{ onClick: () => setOpen(false) }}
      >
        <Header className="flex flex-row items-center justify-between">
          <span>Upgrade</span>
          <svg
            className="w-6 p-1 ml-auto cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            onClick={() => setOpen(false)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Header>

        <Body className="px-4">
          <div className="flex flex-row justify-around">
            <PricingPanel
              plan="Basic"
              originalPrice=""
              price="$0/month"
              description="Free to use for your daily work."
              bullets={[
                "Table view",
                "JSON editor",
                "Preview changes",
                "Import & export",
                "Privacy",
              ]}
              cta="Downgrade"
              ctaAction={(e) => {
                e.preventDefault();
              }}
            />
            <PricingPanel
              plan="Standard"
              originalPrice="$15"
              price="$10/month"
              description="Enjoy with advantage features to boost your productive."
              bullets={[
                "All basic features",
                "Multiple tabs",
                "Unlimited devices",
                "Dark mode (Coming soon)",
                "Your idea",
              ]}
              cta="Upgrade"
              ctaAction={() => handleCheckout("productive")}
              isLarger
            />
            <PricingPanel
              plan="Partner"
              originalPrice="$30"
              price="$15/month"
              description="Get 2 licenses for you and your partner."
              bullets={[
                "All basic features",
                "Multiple tabs",
                "Unlimited devices",
                "Dark mode (Coming soon)",
                "Your idea",
              ]}
              cta="Upgrade"
              ctaAction={() => handleCheckout("productive")}
            />
          </div>
        </Body>
      </Modal>
    </div>
  );
};

export default PricingModal;
