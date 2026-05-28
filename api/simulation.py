import copy
import json
import os
import sys
from http.server import BaseHTTPRequestHandler

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from data_generator import generate_orders
from models import PackingStation
from scheduling.fcfs import schedule_fcfs
from scheduling.hybrid import schedule_hybrid_with_breakdown
from scheduling.sjf import schedule_sjf
from sorting.merge_sort import merge_sort


def _metrics(orders):
    express = [order for order in orders if order.delivery_type == "express"]
    standard = [order for order in orders if order.delivery_type == "standard"]

    def average_turnaround(items):
        return round(sum(order.turnaround_time for order in items) / len(items), 2) if items else 0

    return {
        "average_turnaround": average_turnaround(orders),
        "average_express_turnaround": average_turnaround(express),
        "average_standard_turnaround": average_turnaround(standard),
    }


def build_simulation_state():
    sample_orders = generate_orders(5)
    sorted_sample = merge_sort(sample_orders)
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

    return {
        "incoming_orders": [
            {
                "id": order.order_id,
                "type": order.delivery_type,
                "weight": order.weight,
                "arrival_time": order.arrival_time,
                "processing_time": order.processing_time,
            }
            for order in simulation_orders[:15]
        ],
        "merge_sort_sample": {
            "root": [{"id": order.order_id, "type": order.delivery_type} for order in sample_orders[:4]],
            "sorted": [{"id": order.order_id, "type": order.delivery_type} for order in sorted_sample[:4]],
        },
        "scheduling": {
            "fcfs": _metrics(orders_fcfs),
            "sjf": _metrics(orders_sjf),
            "hybrid": _metrics(orders_hybrid),
        },
        "stations": [
            {"id": "Alpha", "status": "green", "progress": 0},
            {"id": "Beta", "status": "green", "progress": 0},
            {"id": "Gamma", "status": "green", "progress": 0},
        ],
        "metrics": {
            "throughput": [42, 45, 38, 55, 60, 48, 52],
            "order_types": {
                "express": len([order for order in simulation_orders if order.delivery_type == "express"]),
                "standard": len([order for order in simulation_orders if order.delivery_type == "standard"]),
            },
        },
    }


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        payload = json.dumps(build_simulation_state()).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)
