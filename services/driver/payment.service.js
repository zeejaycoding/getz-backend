const Stripe = require("stripe");
const stripe = new Stripe("sk_test_51OjJpTASyMRcymO6FVBewDoB2x4Wi5tq5uX5PYSfkAC2pU0sZvWJbZIqGoMTnzEYYFjFh4jbcWYD3OyFc761otRt00tX4j1UO2");

const createPaymentIntent = async (req,res)=>{
    try {
        const { amount,id } = req.body;
        console.log(amount,'amount')
        const paymentIntent = await stripe.paymentIntents.create(
            {
                amount: amount,
                currency: "usd",
                payment_method_types: ["card"],
                automatic_payment_methods:{enabled:true}
            });
        res.status(200).send({clientSecret: paymentIntent.client_secret,});
    } 
    catch (error) {
        console.log(error)
    }
}

module.exports = {createPaymentIntent}