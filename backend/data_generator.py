import random
from models import Order

def generate_orders(count: int) -> list[Order]:
    orders = []
    for i in range(count):
        order_id = f"ORD{i:04d}"
        weight = round(random.uniform(0.5, 20.0), 2)
        delivery_type = random.choice(["express", "standard"])
        arrival_time = random.randint(0, 100)
        processing_time = int(weight * 2)
        orders.append(Order(order_id, weight, delivery_type, arrival_time, processing_time))
    return orders
