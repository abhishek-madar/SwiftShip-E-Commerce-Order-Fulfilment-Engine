from models import Order, PackingStation

def schedule_fcfs(orders: list[Order], stations: list[PackingStation]) -> None:
    sorted_by_arrival = sorted(orders, key=lambda o: o.arrival_time)
    
    for order in sorted_by_arrival:
        available_station = min(stations, key=lambda s: s.current_time)
        
        start_time = max(available_station.current_time, order.arrival_time)
        order.completion_time = start_time + order.processing_time
        order.turnaround_time = order.completion_time - order.arrival_time
        
        available_station.current_time = order.completion_time
        available_station.completed_orders.append(order)
