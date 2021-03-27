import React, { useState, useRef } from "react";
import { TooltipModal } from "@zendeskgarden/react-modals";
import { Button } from "@zendeskgarden/react-buttons";

const Test = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [
    referenceElement,
    setReferenceElement,
  ] = useState<HTMLButtonElement | null>();

  return (
    <div>
      <Button
        ref={buttonRef}
        onClick={() => {
          setReferenceElement(buttonRef.current);
        }}
      >
        Tooltip modal
      </Button>
      <TooltipModal
        referenceElement={referenceElement}
        onClose={() => setReferenceElement(null)}
        placement="top"
      >
        <TooltipModal.Title>Tooltip modal header</TooltipModal.Title>
        <TooltipModal.Body>
          Gumbo beet greens corn soko endive gumbo gourd. Parsley shallot
          courgette tatsoi pea sprouts fava bean collard greens dandelion okra
          wakame tomato. Dandelion cucumber earthnut pea peanut soko zucchini.
        </TooltipModal.Body>
        <TooltipModal.Close aria-label="Close" />
      </TooltipModal>
    </div>
  );
};

export default Test;
