// REMEMBER TO USE RELATIVE URLS
// '/api/v1/...'
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51NgvWQDFESPntBMNAicNmxYcIvFsMtxS0o8raPPWT6I4wmLg2fZgbPhG3TgKvwSosMDcs8GGDCrx1HfGJtBu9FvV00gnqJTYol'
);

export const bookTour = async (tourId) => {
  try {
    // get checkout session from api endpoint
    // /api/v1/bookings/checkout-session/[tourId]
    const response = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // create checkout form and charge credit card
    await stripe.redirectToCheckout({
      sessionId: response.data.session.id,
    });
  } catch (err) {
    console.error(err);
    showAlert(err.message);
  }
};
