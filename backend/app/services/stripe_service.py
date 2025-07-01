import stripe
from decouple import config
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

class StripeService:
    def __init__(self):
        stripe.api_key = config("STRIPE_SECRET_KEY")
        self.webhook_secret = config("STRIPE_WEBHOOK_SECRET")

    def create_payment_intent(
        self,
        amount: int,
        currency: str = "usd",
        metadata: Optional[Dict[str, str]] = None
    ) -> stripe.PaymentIntent:
        """Create a Stripe payment intent"""
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            logger.info(f"Created payment intent: {payment_intent.id}")
            return payment_intent
        
        except Exception as e:
            logger.error(f"Error creating payment intent: {e}")
            raise

    def create_customer(
        self,
        email: str,
        name: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> stripe.Customer:
        """Create a Stripe customer"""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata=metadata or {}
            )
            logger.info(f"Created customer: {customer.id}")
            return customer
        
        except Exception as e:
            logger.error(f"Error creating customer: {e}")
            raise

    def retrieve_payment_intent(self, payment_intent_id: str) -> stripe.PaymentIntent:
        """Retrieve a payment intent"""
        try:
            return stripe.PaymentIntent.retrieve(payment_intent_id)
        except Exception as e:
            logger.error(f"Error retrieving payment intent: {e}")
            raise

    def create_subscription(
        self,
        customer_id: str,
        price_id: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> stripe.Subscription:
        """Create a subscription"""
        try:
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{'price': price_id}],
                metadata=metadata or {}
            )
            logger.info(f"Created subscription: {subscription.id}")
            return subscription
        
        except Exception as e:
            logger.error(f"Error creating subscription: {e}")
            raise

    def create_invoice(
        self,
        customer_id: str,
        amount: int,
        description: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> stripe.Invoice:
        """Create an invoice"""
        try:
            # Create invoice item
            stripe.InvoiceItem.create(
                customer=customer_id,
                amount=amount,
                currency="usd",
                description=description,
                metadata=metadata or {}
            )
            
            # Create and send invoice
            invoice = stripe.Invoice.create(
                customer=customer_id,
                auto_advance=True,
                metadata=metadata or {}
            )
            
            invoice = stripe.Invoice.send_invoice(invoice.id)
            logger.info(f"Created and sent invoice: {invoice.id}")
            return invoice
        
        except Exception as e:
            logger.error(f"Error creating invoice: {e}")
            raise

    def refund_payment(
        self,
        payment_intent_id: str,
        amount: Optional[int] = None,
        reason: str = "requested_by_customer"
    ) -> stripe.Refund:
        """Refund a payment"""
        try:
            refund_data = {
                "payment_intent": payment_intent_id,
                "reason": reason
            }
            
            if amount:
                refund_data["amount"] = amount
            
            refund = stripe.Refund.create(**refund_data)
            logger.info(f"Created refund: {refund.id}")
            return refund
        
        except Exception as e:
            logger.error(f"Error creating refund: {e}")
            raise

    def list_payment_methods(self, customer_id: str) -> List[stripe.PaymentMethod]:
        """List customer's payment methods"""
        try:
            payment_methods = stripe.PaymentMethod.list(
                customer=customer_id,
                type="card"
            )
            return payment_methods.data
        
        except Exception as e:
            logger.error(f"Error listing payment methods: {e}")
            raise

    def create_setup_intent(
        self,
        customer_id: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> stripe.SetupIntent:
        """Create setup intent for saving payment methods"""
        try:
            setup_intent = stripe.SetupIntent.create(
                customer=customer_id,
                payment_method_types=["card"],
                metadata=metadata or {}
            )
            logger.info(f"Created setup intent: {setup_intent.id}")
            return setup_intent
        
        except Exception as e:
            logger.error(f"Error creating setup intent: {e}")
            raise

    def verify_webhook_signature(self, payload: bytes, sig_header: str) -> Dict[str, Any]:
        """Verify webhook signature and return event"""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret
            )
            return event
        except ValueError as e:
            logger.error(f"Invalid payload: {e}")
            raise
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {e}")
            raise

    def get_balance(self) -> stripe.Balance:
        """Get account balance"""
        try:
            return stripe.Balance.retrieve()
        except Exception as e:
            logger.error(f"Error retrieving balance: {e}")
            raise

    def list_charges(self, limit: int = 10, customer: Optional[str] = None) -> List[stripe.Charge]:
        """List charges"""
        try:
            params = {"limit": limit}
            if customer:
                params["customer"] = customer
            
            charges = stripe.Charge.list(**params)
            return charges.data
        
        except Exception as e:
            logger.error(f"Error listing charges: {e}")
            raise
