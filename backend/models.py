from dataclasses import dataclass
from typing import List

@dataclass
class Order:
    order_id: str
    weight: float
    delivery_type: str
    arrival_time: int
    processing_time: int
    completion_time: int = 0
    turnaround_time: int = 0

class PackingStation:
    def __init__(self, station_id: str):
        self.station_id = station_id
        self.current_time = 0
        self.completed_orders: List[Order] = []
        self.is_broken = False
