# SwiftShip Engine - User Guide & Project Documentation

## About The Project
**SwiftShip Engine** is a high-performance simulation of a modern e-commerce warehouse. It demonstrates how advanced computer science concepts solve real-world logistics problems.

- **Algorithm (DAA):** Uses *Merge Sort* to instantly organize huge batches of chaotic incoming orders by Priority (Express vs Standard) and Arrival Time.
- **Operating Systems (OS):** Uses *CPU Scheduling (SJF & FCFS)* to distribute packages among "Packing Stations" (simulating multi-core processors) to maximize throughput.

---

## Page-by-Page Breakdown

### 1. Dashboard (The Command Center)
This is your global overview. It combines elements from all other pages into a beautiful layout.
- **Live Order Flow:** A scrolling ticker showing new orders arriving into the warehouse.
- **Merge Sort Optimizer:** A visualizer. Click "Run Sort" to see how the engine mathematically splits and merges unordered packages to figure out what needs to ship first.
- **CPU Scheduling:** Shows real-time queue congestion. *SJF* handles Express (fastest jobs first), *FCFS* handles Standard (first in, first out).
- **Packing Stations:** These act as your CPU Cores. If a ring hits 100%, an order is shipped!

### 2. Orders (The Input Feed)
Manage the data entering the simulation.
- **Manual Entry:** Type a weight, select Express/Standard, and inject a custom order into the live queues.
- **Generate +10:** Instantly blasts 10 random orders into the simulation to test how the engine handles a traffic spike.
- **Live Table:** A database view of every order, showing exactly how long it takes to process.

### 3. Scheduling (The Brain)
Look under the hood of the CPU dispatch logic.
- **Detailed Trace Logs:** A live history of exactly *which* order was given to *which* station at exactly *what* time.
- **Process 1 Tick:** If you set the simulation speed to Manual in Settings, use this button to step forward 1 second at a time to slowly analyze the sorting decisions.

### 4. Stations (The Workers)
Monitor your physical packing fleet.
- **Power Buttons:** Click these to simulate a hardware breakdown! The station turns red, stops working, and the engine will instantly rescue the package it was working on and re-route it back to the scheduling queues.

### 5. Analytics & Alerts
- **Analytics:** A full-screen historical chart tracking your warehouse throughput (Packages completed over the last 60 seconds).
- **Alerts:** The global event log warning you of breakdowns, repairs, and massive order inflows.

### 6. Settings (The Controls)
- **Simulation Speed:** Change how fast time passes. Normal (1s), Fast (0.5s), or completely stop it (Manual) for debugging.
- **Default Mode:** By default, we use a custom *Hybrid* scheduler. You can override the engine to force all orders into *Pure FCFS* (fair but slow) or *Pure SJF* (fast but delays large orders).
