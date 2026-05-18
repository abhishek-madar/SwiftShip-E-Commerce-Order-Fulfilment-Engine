from models import Order

def compare_orders(a: Order, b: Order) -> bool:
    if a.delivery_type != b.delivery_type:
        return a.delivery_type == "express"
    return a.arrival_time < b.arrival_time

def merge(left: list[Order], right: list[Order]) -> list[Order]:
    result = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if compare_orders(left[i], right[j]):
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result

def merge_sort(orders: list[Order]) -> list[Order]:
    if len(orders) <= 1:
        return orders

    mid = len(orders) // 2
    left = merge_sort(orders[:mid])
    right = merge_sort(orders[mid:])

    return merge(left, right)
