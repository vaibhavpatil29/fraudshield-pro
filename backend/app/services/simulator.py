import asyncio
import httpx
import random
import uuid
from datetime import datetime

API_URL = "http://localhost:8000/transactions"

# ── Realistic merchant pools ─────────────────────────────────────────────────
NORMAL_MERCHANTS = [
    "Amazon India", "Flipkart", "Swiggy", "Zomato", "BigBasket",
    "Myntra", "Nykaa", "BookMyShow", "MakeMyTrip", "Uber India",
    "Ola Cabs", "Dunzo", "Blinkit", "PharmEasy", "Netmeds"
]

SUSPICIOUS_MERCHANTS = [
    "Unknown Offshore Merchant", "Crypto Exchange XYZ",
    "International Wire Transfer", "Anonymous Gift Cards",
    "Unregistered Vendor 99"
]

NORMAL_DEVICES = [f"device_{i}" for i in range(1, 6)]
USERS          = [f"user_{i:03d}" for i in range(1, 21)]

# ── Fraud patterns ───────────────────────────────────────────────────────────
def normal_transaction():
    return {
        "user_id"          : random.choice(USERS),
        "amount"           : round(random.uniform(100, 5000), 2),
        "currency"         : "INR",
        "merchant"         : random.choice(NORMAL_MERCHANTS),
        "merchant_category": "retail",
        "device_id"        : random.choice(NORMAL_DEVICES),
        "ip_address"       : f"192.168.{random.randint(1,255)}.{random.randint(1,255)}"
    }

def high_amount_fraud():
    """Large amount from unknown merchant — triggers rule engine."""
    return {
        "user_id"          : random.choice(USERS),
        "amount"           : round(random.uniform(55000, 150000), 2),
        "currency"         : "INR",
        "merchant"         : random.choice(SUSPICIOUS_MERCHANTS),
        "merchant_category": "unknown",
        "device_id"        : f"new_device_{uuid.uuid4().hex[:6]}",
        "ip_address"       : f"185.220.{random.randint(1,255)}.{random.randint(1,255)}"
    }

def card_testing_fraud():
    """Many tiny amounts — classic card testing pattern."""
    return {
        "user_id"          : random.choice(USERS),
        "amount"           : round(random.uniform(0.5, 9.99), 2),
        "currency"         : "INR",
        "merchant"         : random.choice(SUSPICIOUS_MERCHANTS),
        "merchant_category": "unknown",
        "device_id"        : f"new_device_{uuid.uuid4().hex[:6]}",
        "ip_address"       : f"185.220.{random.randint(1,255)}.{random.randint(1,255)}"
    }

def account_takeover_fraud():
    """High amount + new device + suspicious merchant."""
    return {
        "user_id"          : random.choice(USERS),
        "amount"           : round(random.uniform(20000, 80000), 2),
        "currency"         : "INR",
        "merchant"         : random.choice(SUSPICIOUS_MERCHANTS),
        "merchant_category": "unknown",
        "device_id"        : f"new_device_{uuid.uuid4().hex[:8]}",
        "ip_address"       : f"103.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}"
    }

# ── Simulator ────────────────────────────────────────────────────────────────
async def run_simulator(
    total_transactions: int = 50,
    fraud_rate: float = 0.25,
    delay_seconds: float = 1.0
):
    """
    Fire transactions at the API.
    fraud_rate = fraction of transactions that are fraudulent patterns.
    """
    print(f"\n{'='*55}")
    print(f"  FraudShield Pro — Transaction Simulator")
    print(f"{'='*55}")
    print(f"  Total transactions : {total_transactions}")
    print(f"  Fraud rate         : {fraud_rate*100:.0f}%")
    print(f"  Delay between txns : {delay_seconds}s")
    print(f"  Started at         : {datetime.now().strftime('%H:%M:%S')}")
    print(f"{'='*55}\n")

    stats = {"sent": 0, "success": 0, "failed": 0, "fraud_injected": 0}

    async with httpx.AsyncClient(timeout=10.0) as client:
        for i in range(total_transactions):
            # Decide transaction type
            rand = random.random()
            if rand < fraud_rate * 0.4:
                txn = high_amount_fraud()
                txn_type = "HIGH_AMOUNT"
                stats["fraud_injected"] += 1
            elif rand < fraud_rate * 0.6:
                txn = card_testing_fraud()
                txn_type = "CARD_TEST "
                stats["fraud_injected"] += 1
            elif rand < fraud_rate:
                txn = account_takeover_fraud()
                txn_type = "ACCT_TAKEOVER"
                stats["fraud_injected"] += 1
            else:
                txn = normal_transaction()
                txn_type = "NORMAL    "

            try:
                response = await client.post(API_URL, json=txn)
                if response.status_code == 201:
                    data = response.json()
                    stats["success"] += 1
                    print(
                        f"  [{i+1:03d}] {txn_type} | "
                        f"₹{txn['amount']:>10.2f} | "
                        f"{txn['merchant'][:25]:<25} | "
                        f"txn_id: {data['id'][:8]}..."
                    )
                else:
                    stats["failed"] += 1
                    print(f"  [{i+1:03d}] FAILED — HTTP {response.status_code}")

            except Exception as e:
                stats["failed"] += 1
                print(f"  [{i+1:03d}] ERROR — {e}")

            stats["sent"] += 1
            await asyncio.sleep(delay_seconds)

    print(f"\n{'='*55}")
    print(f"  Simulation complete!")
    print(f"  Sent    : {stats['sent']}")
    print(f"  Success : {stats['success']}")
    print(f"  Failed  : {stats['failed']}")
    print(f"  Fraud patterns injected: {stats['fraud_injected']}")
    print(f"{'='*55}\n")

if __name__ == "__main__":
    asyncio.run(run_simulator(
        total_transactions=30,
        fraud_rate=0.30,
        delay_seconds=0.8
    ))