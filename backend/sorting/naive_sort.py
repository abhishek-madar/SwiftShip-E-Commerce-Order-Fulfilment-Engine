from models import Order
from sorting.merge_sort import compare_orders

def naive_sort(orders: list[Order]) -> list[Order]:
    n = len(orders)
    result = list(orders)
    for i in range(n):
        for j in range(0, n - i - 1):
            if compare_orders(result[j + 1], result[j]):
                result[j], result[j + 1] = result[j + 1], result[j]
    return result
