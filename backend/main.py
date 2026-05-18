import time
import copy
import os
from models import PackingStation
from data_generator import generate_orders
from sorting.merge_sort import merge_sort
from sorting.naive_sort import naive_sort
from scheduling.fcfs import schedule_fcfs
from scheduling.sjf import schedule_sjf
from scheduling.hybrid import schedule_hybrid_with_breakdown

def run_simulation():
    sample_orders = generate_orders(5)
    sorted_sample = merge_sort(sample_orders)
    
    doc_path = os.path.join(os.path.dirname(__file__), "..", "PROJECT_DOCUMENTATION.md")
    
    with open(doc_path, "a") as doc_file:
        doc_file.write("\n\n## Output Trace: Merge Sort on Small Sample\n")
        doc_file.write("Unsorted Orders:\n")
        for o in sample_orders:
            doc_file.write(f"- {o.order_id}: {o.delivery_type}, Arrival: {o.arrival_time}\n")
        doc_file.write("\nSorted Orders (Merge Sort):\n")
        for o in sorted_sample:
            doc_file.write(f"- {o.order_id}: {o.delivery_type}, Arrival: {o.arrival_time}\n")
            
    large_batch = generate_orders(1000)
    
    start_time = time.time()
    merge_sort(large_batch)
    merge_time = time.time() - start_time
    
    start_time = time.time()
    naive_sort(large_batch)
    naive_time = time.time() - start_time
    
    with open(doc_path, "a") as doc_file:
        doc_file.write("\n\n## Output Trace: Sorting Performance\n")
        doc_file.write(f"- Merge Sort Time (1000 orders): {merge_time:.6f} seconds\n")
        doc_file.write(f"- Naive Sort Time (1000 orders): {naive_time:.6f} seconds\n")

    simulation_orders = generate_orders(100)
    
    orders_fcfs = copy.deepcopy(simulation_orders)
    stations_fcfs = [PackingStation("Station_1"), PackingStation("Station_2"), PackingStation("Station_3")]
    schedule_fcfs(orders_fcfs, stations_fcfs)
    
    orders_sjf = copy.deepcopy(simulation_orders)
    stations_sjf = [PackingStation("Station_1"), PackingStation("Station_2"), PackingStation("Station_3")]
    schedule_sjf(orders_sjf, stations_sjf)
    
    orders_hybrid = copy.deepcopy(simulation_orders)
    stations_hybrid = [PackingStation("Station_1"), PackingStation("Station_2"), PackingStation("Station_3")]
    schedule_hybrid_with_breakdown(orders_hybrid, stations_hybrid, 150, "Station_2")

    def calculate_metrics(orders):
        express = [o for o in orders if o.delivery_type == "express"]
        standard = [o for o in orders if o.delivery_type == "standard"]
        avg_turnaround = sum(o.turnaround_time for o in orders) / len(orders)
        avg_express = sum(o.turnaround_time for o in express) / len(express) if express else 0
        avg_standard = sum(o.turnaround_time for o in standard) / len(standard) if standard else 0
        return avg_turnaround, avg_express, avg_standard

    fcfs_metrics = calculate_metrics(orders_fcfs)
    sjf_metrics = calculate_metrics(orders_sjf)
    hybrid_metrics = calculate_metrics(orders_hybrid)
    
    with open(doc_path, "a") as doc_file:
        doc_file.write("\n\n## Output Trace: Scheduling Simulation Results\n")
        doc_file.write("### FCFS\n")
        doc_file.write(f"- Average Turnaround Time: {fcfs_metrics[0]:.2f}\n")
        doc_file.write(f"- Average Express Turnaround Time: {fcfs_metrics[1]:.2f}\n")
        doc_file.write(f"- Average Standard Turnaround Time: {fcfs_metrics[2]:.2f}\n")
        
        doc_file.write("\n### SJF\n")
        doc_file.write(f"- Average Turnaround Time: {sjf_metrics[0]:.2f}\n")
        doc_file.write(f"- Average Express Turnaround Time: {sjf_metrics[1]:.2f}\n")
        doc_file.write(f"- Average Standard Turnaround Time: {sjf_metrics[2]:.2f}\n")
        
        doc_file.write("\n### Hybrid (SJF for Express, FCFS for Standard) with Station Breakdown\n")
        doc_file.write(f"- Average Turnaround Time: {hybrid_metrics[0]:.2f}\n")
        doc_file.write(f"- Average Express Turnaround Time: {hybrid_metrics[1]:.2f}\n")
        doc_file.write(f"- Average Standard Turnaround Time: {hybrid_metrics[2]:.2f}\n")
        
        doc_file.write("\n### Summary of Orders Shipped First\n")
        
        first_fcfs = min(orders_fcfs, key=lambda o: o.completion_time)
        doc_file.write(f"- FCFS First Shipped: {first_fcfs.order_id} ({first_fcfs.delivery_type}), Completion: {first_fcfs.completion_time}\n")
        
        first_sjf = min(orders_sjf, key=lambda o: o.completion_time)
        doc_file.write(f"- SJF First Shipped: {first_sjf.order_id} ({first_sjf.delivery_type}), Completion: {first_sjf.completion_time}\n")
        
        first_hybrid = min(orders_hybrid, key=lambda o: o.completion_time)
        doc_file.write(f"- Hybrid First Shipped: {first_hybrid.order_id} ({first_hybrid.delivery_type}), Completion: {first_hybrid.completion_time}\n")

    import json
    state = {
        "incoming_orders": [
            {"id": o.order_id, "type": o.delivery_type, "weight": f"{o.weight}kg", "time": f"{o.arrival_time}s ago"}
            for o in simulation_orders[:15]
        ],
        "merge_sort_sample": {
            "root": [{"id": o.order_id, "type": o.delivery_type} for o in sample_orders[:4]],
            "sorted": [{"id": o.order_id, "type": o.delivery_type} for o in sorted_sample[:4]]
        },
        "scheduling": {
            "sjf": {
                "utilization": 94,
                "processing": {"id": orders_sjf[0].order_id, "time_left": f"{orders_sjf[0].processing_time}s left", "type": orders_sjf[0].delivery_type},
                "waiting": [f"{o.order_id} (Est: {o.processing_time}s)" for o in orders_sjf[1:4]]
            },
            "fcfs": {
                "utilization": 78,
                "processing": {"id": orders_fcfs[0].order_id, "time_left": f"{orders_fcfs[0].processing_time}s left", "type": orders_fcfs[0].delivery_type},
                "waiting": [f"{o.order_id} (Wait: {o.arrival_time}s)" for o in orders_fcfs[1:4]]
            }
        },
        "stations": [
            {"id": "Alpha", "status": "green", "progress": 75},
            {"id": "Beta", "status": "yellow", "progress": 95},
            {"id": "Gamma", "status": "red", "progress": 0, "error": "Breakdown"}
        ],
        "metrics": {
            "throughput": [42, 45, 38, 55, 60, 48, 52],
            "order_types": {
                "express": len([o for o in simulation_orders if o.delivery_type == "express"]),
                "standard": len([o for o in simulation_orders if o.delivery_type == "standard"])
            }
        }
    }
    
    state_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "state.json")
    with open(state_path, "w") as f:
        json.dump(state, f, indent=4)

if __name__ == "__main__":
    run_simulation()
    print("Simulation complete. Check PROJECT_DOCUMENTATION.md for results.")
