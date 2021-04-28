// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
import * as functions from "firebase-functions";
import { ChargeBee } from "chargebee-typescript";

const chargeBee = new ChargeBee();

function initChargeBee() {
  chargeBee.configure({
    site: "refiapp-test",
    api_key: "test_fhYzagT9cda0TzNK3EGOYPUhFPW8HQszA",
  });
}

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const checkoutURL = functions.https.onCall(async (data) => {
  // TODO: Check if login
  initChargeBee();
  return await new Promise((resolve, reject) => {
    chargeBee.hosted_page.checkout_new(data)
      .request(function (error: Error, result: any) {
        if (error) {
          return reject(error);
        }

        return resolve(result.hosted_page);
      });
  });
});

export const hookOnNewCustomer = functions.https.onRequest((req, res) => {

});

export const getUserInfo = functions.https.onCall(async (data) => {
  // TODO: Check if login
  initChargeBee();
  const subscriptionId = "16BjuHSVPcVEJHnD";
  const subscriptionDetail = new Promise((resolve, reject) => {
    chargeBee.subscription.retrieve(subscriptionId)
      .request(function (error: Error, result: any) {
        if (error) {
          return reject(error);
        }
        const customer: typeof chargeBee.customer = result.customer;
        const subscription: typeof chargeBee.subscription = result.subscription;
        const card: typeof chargeBee.card = result.card;

        console.log({ customer, subscription, card });

        return resolve({ customer, subscription, card });
      });
  });

  return await subscriptionDetail;
});
