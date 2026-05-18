from models import Order, PackingStation

def schedule_hybrid_with_breakdown(orders: list[Order], stations: list[PackingStation], breakdown_time: int, broken_station_id: str) -> None:
    express_orders = [o for o in orders if o.delivery_type == "express"]
    standard_orders = [o for o in orders if o.delivery_type == "standard"]
    
    pending_orders = express_orders + standard_orders
    
    while pending_orders:
        active_stations = [s for s in stations if not s.is_broken]
        if not active_stations:
            break
            
        available_station = min(active_stations, key=lambda s: s.current_time)
        
        if available_station.current_time >= breakdown_time and available_station.station_id == broken_station_id:
            available_station.is_broken = True
            continue
            
        current_time = available_station.current_time
        arrived_express = [o for o in pending_orders if o.delivery_type == "express" and o.arrival_time <= current_time]
        
        selected_order = None
        
        if arrived_express:
            selected_order = min(arrived_express, key=lambda o: o.processing_time)
        else:
            arrived_standard = [o for o in pending_orders if o.delivery_type == "standard" and o.arrival_time <= current_time]
            if arrived_standard:
                selected_order = min(arrived_standard, key=lambda o: o.arrival_time)
                
        if not selected_order:
            next_arrival = min(pending_orders, key=lambda o: o.arrival_time).arrival_time
            if next_arrival >= breakdown_time and not any(s.is_broken for s in stations if s.station_id == broken_station_id):
                target_station = next((s for s in stations if s.station_id == broken_station_id), None)
                if target_station:
                    target_station.current_time = breakdown_time
                    target_station.is_broken = True
                    continue
            available_station.current_time = next_arrival
            continue
            
        pending_orders.remove(selected_order)
        start_time = max(available_station.current_time, selected_order.arrival_time)
        selected_order.completion_time = start_time + selected_order.processing_time
        selected_order.turnaround_time = selected_order.completion_time - selected_order.arrival_time
        
        available_station.current_time = selected_order.completion_time
        available_station.completed_orders.append(selected_order)
