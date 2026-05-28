# SwiftShip: E-Commerce Order Fulfilment Engine

## Overview
This project simulates an order fulfilment engine for an e-commerce platform. It implements Merge Sort for order prioritization and CPU scheduling algorithms (FCFS, SJF, and Hybrid) for assigning orders to packing stations.

## Project Structure
- `backend/models.py`: Data classes representing `Order` and `PackingStation`.
- `backend/data_generator.py`: Utility functions for generating random test datasets.
- `backend/sorting/merge_sort.py`: Implementation of the Merge Sort algorithm based on priority rules.
- `backend/sorting/naive_sort.py`: Implementation of Bubble Sort for performance comparison.
- `backend/scheduling/fcfs.py`: First-Come, First-Served scheduling implementation.
- `backend/scheduling/sjf.py`: Shortest Job First scheduling implementation.
- `backend/scheduling/hybrid.py`: Hybrid scheduling implementation (SJF for express, FCFS for standard) with station breakdown handling.
- `backend/main.py`: The entry point that executes the simulation, runs comparisons, and generates output traces.
- `frontend/index.html`: The main futuristic dashboard UI layout.
- `frontend/style.css`: Dashboard styling including dark mode, glassmorphism, and neon glowing accents.
- `frontend/script.js`: Interactive elements, animations, and Chart.js integration for system analytics.

## Design Decisions
1. **Self-Documenting Code**: The source code relies on clear variable naming and strict adherence to a "no inline comments" policy.
2. **Order Priorities**: Orders are sorted primarily by `delivery_type` ('express' before 'standard') and secondarily by `arrival_time`.
3. **Processing Time**: An order's `processing_time` is simulated based on its weight.

## Algorithm Correctness: Merge Sort
### Loop Invariant for the Merge Step
**Initialization**: Before the first iteration of the merging loop, the merged array is empty, which is trivially sorted. The pointers to the left and right subarrays are at their beginnings.
**Maintenance**: In each step, the algorithm compares the elements at the current pointers of the left and right subarrays. The smaller (or higher priority) element is appended to the merged array, and the corresponding pointer is incremented. Since both subarrays are already sorted, the appended element is guaranteed to be smaller than or equal to all remaining elements in both subarrays. Thus, the merged array remains sorted.
**Termination**: The loop terminates when all elements from at least one subarray have been merged. The remaining elements in the other subarray are already sorted and greater than or equal to all elements in the merged array, so they can be appended directly. The final merged array contains all elements from both subarrays in sorted order.

## Performance Comparison: Merge Sort vs. Naive Sort
Merge Sort has a time complexity of O(n log n), while Naive Sort (Bubble Sort) has O(n^2). For 1000 orders, Merge Sort completes significantly faster, demonstrating its efficiency for larger datasets.

## Scheduling Strategies Comparison
- **FCFS (First-Come, First-Served)**: Processes orders strictly by arrival time. Express orders arriving later will be delayed behind earlier standard orders.
- **SJF (Shortest Job First)**: Processes orders with the shortest processing time first (non-preemptive). Can improve average turnaround time but may delay larger express orders.
- **Hybrid**: Uses SJF for express orders and FCFS for standard orders. This ensures express orders are shipped faster while maintaining a fair queue for standard ones.

## Breakdown Handling
The hybrid scheduler includes logic to handle packing station breakdowns. When a station breaks down, its pending orders are conceptually reassigned because the central scheduler ignores the broken station and assigns subsequent tasks only to healthy stations, simulating load redistribution in a real warehouse environment.


## Output Trace: Merge Sort on Small Sample
Unsorted Orders:
- ORD0000: express, Arrival: 42
- ORD0001: standard, Arrival: 54
- ORD0002: express, Arrival: 81
- ORD0003: standard, Arrival: 0
- ORD0004: standard, Arrival: 39

Sorted Orders (Merge Sort):
- ORD0000: express, Arrival: 42
- ORD0002: express, Arrival: 81
- ORD0003: standard, Arrival: 0
- ORD0004: standard, Arrival: 39
- ORD0001: standard, Arrival: 54


## Output Trace: Sorting Performance
- Merge Sort Time (1000 orders): 0.001373 seconds
- Naive Sort Time (1000 orders): 0.047904 seconds


## Output Trace: Scheduling Simulation Results
### FCFS
- Average Turnaround Time: 283.67
- Average Express Turnaround Time: 295.19
- Average Standard Turnaround Time: 273.45

### SJF
- Average Turnaround Time: 186.00
- Average Express Turnaround Time: 184.45
- Average Standard Turnaround Time: 187.38

### Hybrid (SJF for Express, FCFS for Standard) with Station Breakdown
- Average Turnaround Time: 350.27
- Average Express Turnaround Time: 94.72
- Average Standard Turnaround Time: 576.89

### Summary of Orders Shipped First
- FCFS First Shipped: ORD0026 (standard), Completion: 12
- SJF First Shipped: ORD0026 (standard), Completion: 12
- Hybrid First Shipped: ORD0026 (standard), Completion: 12


## Output Trace: Merge Sort on Small Sample
Unsorted Orders:
- ORD0000: express, Arrival: 75
- ORD0001: express, Arrival: 60
- ORD0002: express, Arrival: 45
- ORD0003: standard, Arrival: 85
- ORD0004: standard, Arrival: 88

Sorted Orders (Merge Sort):
- ORD0002: express, Arrival: 45
- ORD0001: express, Arrival: 60
- ORD0000: express, Arrival: 75
- ORD0003: standard, Arrival: 85
- ORD0004: standard, Arrival: 88


## Output Trace: Sorting Performance
- Merge Sort Time (1000 orders): 0.001434 seconds
- Naive Sort Time (1000 orders): 0.047263 seconds


## Output Trace: Scheduling Simulation Results
### FCFS
- Average Turnaround Time: 267.99
- Average Express Turnaround Time: 271.82
- Average Standard Turnaround Time: 264.16

### SJF
- Average Turnaround Time: 177.34
- Average Express Turnaround Time: 186.90
- Average Standard Turnaround Time: 167.78

### Hybrid (SJF for Express, FCFS for Standard) with Station Breakdown
- Average Turnaround Time: 344.27
- Average Express Turnaround Time: 105.08
- Average Standard Turnaround Time: 583.46

### Summary of Orders Shipped First
- FCFS First Shipped: ORD0092 (standard), Completion: 15
- SJF First Shipped: ORD0092 (standard), Completion: 15
- Hybrid First Shipped: ORD0092 (standard), Completion: 15


## Output Trace: Merge Sort on Small Sample
Unsorted Orders:
- ORD0000: standard, Arrival: 2
- ORD0001: express, Arrival: 74
- ORD0002: express, Arrival: 56
- ORD0003: express, Arrival: 82
- ORD0004: express, Arrival: 8

Sorted Orders (Merge Sort):
- ORD0004: express, Arrival: 8
- ORD0002: express, Arrival: 56
- ORD0001: express, Arrival: 74
- ORD0003: express, Arrival: 82
- ORD0000: standard, Arrival: 2


## Output Trace: Sorting Performance
- Merge Sort Time (1000 orders): 0.001567 seconds
- Naive Sort Time (1000 orders): 0.046791 seconds


## Output Trace: Scheduling Simulation Results
### FCFS
- Average Turnaround Time: 278.04
- Average Express Turnaround Time: 244.00
- Average Standard Turnaround Time: 304.79

### SJF
- Average Turnaround Time: 181.54
- Average Express Turnaround Time: 222.89
- Average Standard Turnaround Time: 149.05

### Hybrid (SJF for Express, FCFS for Standard) with Station Breakdown
- Average Turnaround Time: 366.99
- Average Express Turnaround Time: 108.02
- Average Standard Turnaround Time: 570.46

### Summary of Orders Shipped First
- FCFS First Shipped: ORD0008 (standard), Completion: 17
- SJF First Shipped: ORD0066 (express), Completion: 11
- Hybrid First Shipped: ORD0066 (express), Completion: 11


## Output Trace: Merge Sort on Small Sample
Unsorted Orders:
- ORD0000: express, Arrival: 25
- ORD0001: express, Arrival: 20
- ORD0002: standard, Arrival: 93
- ORD0003: standard, Arrival: 63
- ORD0004: express, Arrival: 61

Sorted Orders (Merge Sort):
- ORD0001: express, Arrival: 20
- ORD0000: express, Arrival: 25
- ORD0004: express, Arrival: 61
- ORD0003: standard, Arrival: 63
- ORD0002: standard, Arrival: 93


## Output Trace: Sorting Performance
- Merge Sort Time (1000 orders): 0.002107 seconds
- Naive Sort Time (1000 orders): 0.068103 seconds


## Output Trace: Scheduling Simulation Results
### FCFS
- Average Turnaround Time: 304.79
- Average Express Turnaround Time: 328.76
- Average Standard Turnaround Time: 280.82

### SJF
- Average Turnaround Time: 211.16
- Average Express Turnaround Time: 219.20
- Average Standard Turnaround Time: 203.12

### Hybrid (SJF for Express, FCFS for Standard) with Station Breakdown
- Average Turnaround Time: 381.52
- Average Express Turnaround Time: 133.10
- Average Standard Turnaround Time: 629.94

### Summary of Orders Shipped First
- FCFS First Shipped: ORD0085 (standard), Completion: 6
- SJF First Shipped: ORD0085 (standard), Completion: 6
- Hybrid First Shipped: ORD0085 (standard), Completion: 6
