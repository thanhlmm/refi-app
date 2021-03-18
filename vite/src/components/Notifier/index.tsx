import React, { useEffect } from "react";
import { Title, Notification, Close } from "@zendeskgarden/react-notifications";
import ReactDOM from "react-dom";
import { useRecoilState } from "recoil";
import { notifierAtom } from "@/atoms/ui";

const Notifier = () => {
  const [notifications, setNotification] = useRecoilState(notifierAtom);

  const handleCloseNotification = (id) => {
    setNotification((list) => list.filter((notif) => notif.id !== id));
  };

  const notificationList = notifications.map((notif) => (
    <Notification key={notif.id} type={notif.type} className="mt-4">
      <Title>{notif.type}</Title>
      {notif.message}
      <Close
        aria-label="Close Alert"
        onClick={() => handleCloseNotification(notif.id)}
      />
    </Notification>
  ));

  return ReactDOM.createPortal(
    notificationList,
    document.querySelector("#notifications") || document.body
  );
};

export default Notifier;
