/* eslint-disable */
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51PPMYw04EOVO7dwcTyZoi5eKobKObOtXYojAjQKtin3z8C4cV1h17nBS9eaZDY1AISIwqYkoCJ2OgUOOqwcFpnbK00kn7dU0uB');

// tourID is gonna come from tour page from Book Tour button in tour.pug
export const bookTour = async tourID => {
    try{
        // 1) Get checkout session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourID}`);
        // console.log(session);

        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId : session.data.session.id
        });
    }catch(err){
        console.log(err);
        showAlert('error', err.message);
    }
}