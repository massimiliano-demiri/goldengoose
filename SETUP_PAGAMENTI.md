# Configurazione Email e Pagamenti

## EmailJS Setup (GRATUITO - 300 email/mese)

1. Vai su https://www.emailjs.com/
2. Registrati gratuitamente
3. Crea un servizio email (Gmail, Outlook, etc.)
4. Crea un template con queste variabili:
   - order_id
   - customer_name
   - customer_email
   - order_total
   - order_items
   - order_date
   - tracking_link

5. Copia SERVICE_ID, TEMPLATE_ID e PUBLIC_KEY nel file client/.env

## PayPal Sandbox (GRATUITO)

1. Vai su https://developer.paypal.com/
2. Crea Business Sandbox Account
3. Ottieni Client ID
4. Aggiungi al client/.env: VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id

## Stripe Test Mode (GRATUITO)

1. Vai su https://stripe.com/
2. Registrati
3. Ottieni Test Public Key (pk_test_...)
4. Aggiungi al client/.env: VITE_STRIPE_PUBLIC_KEY=pk_test_...

## Carta Test Stripe
- Numero: 4242 4242 4242 4242
- Scadenza: qualsiasi data futura
- CVV: qualsiasi 3 cifre

---

TUTTI I PAGAMENTI SONO IN MODALITÀ TEST - NESSUN ADDEBITO REALE
