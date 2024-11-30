const express = require('express');
const router = express.Router();
const  paymentModel= require('../models/payment');

/*router.get('/:orderid/:paymentid/:signature',async (req,res)=>{
     let productDetails =   await productModel.findOne({
           orderId:req.params.orderid,
       });
       if(!productDetails) return res.send("Payment Is Not Completed");
       if(req.params.paymentid === productDetails.paymentId && req.params.signature === productDetails.signature) res.send("Valid Payment Succesfully");
});
*/
router.get('/:orderid/:paymentid/:signature', async (req, res) => {
    try {
        let productDetails = await paymentModel.findOne({
            orderId: req.params.orderid,
        });
        console.log("Product Detail:",productDetails);
        if (!productDetails) {
            console.log("Product not found or payment not completed");
            return res.send("Payment Is Not Completed");
        }

        // Comparing paymentId and signature with the stored values
        if (req.params.paymentid === productDetails.paymentId && req.params.signature === productDetails.signature) {
            res.send("Valid Payment Successfully");
        } else {
            res.send("Payment details do not match.");
        }
    } catch (error) {
        console.error("Error in payment validation:", error);
        res.status(500).send("An error occurred while verifying payment.");
    }
});


module.exports = router;
