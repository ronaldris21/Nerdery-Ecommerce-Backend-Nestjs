import React, { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CardTable from './CardTable';

const stripePromise = loadStripe('pk_test_51Qafnm062gksTdkEBglYLWG8o8yqNSRalzM6JNicyDXpA24DRyjzv4m00uAGTXSuM7iOo40ndWvXRxuWCbxVPVG300DccRZZVI');

const CheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setPaymentStatus(`Error: ${error.message}`);
    } else if (paymentIntent.status === 'succeeded') {
      setPaymentStatus('Payment succeeded!');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="card-element-wrapper">
        <CardElement className="card-element" />
      </div>
      <button type="submit" disabled={!stripe || loading} className="submit-button">
        {loading ? 'Processing...' : 'Pay'}
      </button>
      {paymentStatus && <p className="payment-status">{paymentStatus}</p>}
    </form>
  );
};

const App = () => {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientSecret = urlParams.get('clientSecret');
    if (clientSecret) {
      setClientSecret(clientSecret);
    }
  }, []);

  return (
    <div className="app-container">
      <div className="app-card">
        <h1 className="app-title">Stripe Payment</h1>
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        ) : (
          <p className="loading-text">Loading...</p>
        )}
      </div >
      <CardTable/>
    </div>
  );
};

export default App;

/* CSS */
/* Add this CSS to a separate file (e.g., App.css) */

