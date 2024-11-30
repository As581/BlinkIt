const express = require('express');
const router = express.Router();
const paymentModel = require('../models/payment');
const {cartModel} = require('../models/cart');
require('dotenv').config();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: 'rzp_test_MpHUxClOLk736E',
  key_secret: 'L4AOuZFHgrP1re36wzHML76C',
});
router.post('/create/orderId', async (req, res) => {
  /*let cart = await cartModel.findOne();
  const options = {
   // amount: 5000 * 100,
    amount:Number(cart.TotalPrice),
    currency: "INR",
  };

  try {
    console.log("Creating order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Order created:", order);

    const newPayment = await paymentModel.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'pending',
    });

    console.log("Payment record created:", newPayment);
    res.send(order);
  } catch (error) {
    console.error("Error creating order:", error.message || error);
    res.status(500).send(`Error creating order: ${error.message || error}`);
  }
  */
  let cart = await cartModel.findOne();

// Ensure cart.TotalPrice is in rupees, and convert it to paise
const options = {
  amount: Math.round(Number(cart.TotalPrice) * 100), // Convert rupees to paise
  currency: "INR",
};

try {
  console.log("Creating order with options:", options);
  const order = await razorpay.orders.create(options);
  console.log("Order created:", order);

  const newPayment = await paymentModel.create({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    status: 'pending',
  });

  console.log("Payment record created:", newPayment);
  res.send(order);
} catch (error) {
  console.error("Error creating order:", error.message || error);
  res.status(500).send(`Error creating order: ${error.message || error}`);
}

});



/*router.post('/api/payment/verify', async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = 'L4AOuZFHgrP1re36wzHML76C';

  try {
    const { validatePaymentVerification } = require('../node_modules/razorpay/dist/utils/razorpay-utils.js')

    const result = validatePaymentVerification({ "order_id": razorpayOrderId, "payment_id": razorpayPaymentId }, signature, secret);
    if (result) {
      const payment = await paymentModel.findOne({ orderId: razorpayOrderId,status:"pending" });
      payment.paymentId = razorpayPaymentId;
      payment.signature = signature;
      payment.status = 'completed';
      await payment.save();
      res.json({ status: 'success' });
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Error verifying payment');
  }
});
*/
router.post('/api/payment/verify', async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = 'L4AOuZFHgrP1re36wzHML76C';  // Razorpay secret key

  try {
    // Step 1: Create the expected signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    // Step 2: Compare the expected signature with the actual signature from Razorpay
    if (expectedSignature === signature) {
      // Step 3: Find the payment in the database and update its status
      const payment = await paymentModel.findOne({ orderId: razorpayOrderId, status: 'pending' });
      
      if (!payment) {
        return res.status(404).send('Payment not found or already completed');
      }

      payment.paymentId = razorpayPaymentId;
      payment.signature = signature;
      payment.status = 'completed';
      await payment.save();

      // Step 4: Respond with success
      res.json({ status: 'success' });
    } else {
      // Invalid signature case
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    // Error handling with specific message
    console.error('Error verifying payment:', error);
    res.status(500).send('Error verifying payment');
  }
});






module.exports = router;
