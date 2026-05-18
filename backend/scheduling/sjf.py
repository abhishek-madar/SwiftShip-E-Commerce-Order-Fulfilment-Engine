from models import Order, PackingStation

def schedule_sjf(orders: list[Order], stations: list[PackingStation]) -> None:
    pending_orders = list(orders)
    
    while pending_orders:
        available_station = min(stations, key=lambda s: s.current_time)
        current_time = available_station.current_time
        
        arrived_orders = [o for o in pending_orders if o.arrival_time <= current_time]
        
        if not arrived_orders:
            next_arrival = min(pending_orders, key=lambda o: o.arrival_time).arrival_time
            available_station.current_time = next_arrival
            continue
            
        shortest_order = min(arrived_orders, key=lambda o: o.processing_time)
        pending_orders.remove(shortest_order)
        
        start_time = max(available_station.current_time, shortest_order.arrival_time)
        shortest_order.completion_time = start_time + shortest_order.processing_time
        shortest_order.turnaround_time = shortest_order.completion_time - shortest_order.arrival_time
        
        available_station.current_time = shortest_order.completion_time
        available_station.completed_orders.append(shortest_order)
