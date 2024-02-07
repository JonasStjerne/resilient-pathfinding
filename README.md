# Optimal Pathfinding in Dynamic Environments with Risk-Aware Adapted A* Algorithm
## Overview
This repository contains the code implementation associated with the paper titled "Resilient
multi-destination routing". The research explores the challenges posed by external factors such as wind and water in dynamic environments. The proposed solution involves an adapted A* algorithm that incorporates risk factors to generate paths balancing distance and safety. The algorithm is user-adjustable, allowing for varying risk preferences.

## Key Features
* Adapted A Algorithm: The repository includes the implementation of the adapted A* algorithm designed to handle dynamic environments with external risk factors.

* User-Adjustable Risk Factor: The algorithm allows users to adjust the risk factor, enabling customization based on varying risk preferences.

* Multi-Destination Routing Extension: The algorithm is extended to support multi-destination routing. The Greedy Algorithm and the Held-Karp algorithm are included, highlighting trade-offs between route length and computation time.

* User Interface: A graphical user interface is provided to interactively run the algorithm, visualize paths, edges, and disturbances, create custom maps, auto-generate batches of maps, and adjust parameters.

* Command-Line Interface (CLI): The repository includes a CLI for conducting simulations of the algorithm. This facilitates batch processing of maps.

## Results
The research findings demonstrate a significant improvement in success rates when using the risk-based algorithm compared to the traditional A* algorithm. In our simulations, the rate of successful traversal of maps increased from 66.78% in the normal A* to 96.78% in the risk-adapting algorithm. The algorithm intelligently navigates paths to minimize overall risk exposure in diverse auto-generated environments.

Below an example is shown. When a low risk factor is set the algorithm will avoid dangerous areas and take a longer route.
<p align="center">
  <img width="517" alt="Screenshot 2024-02-07 at 07 09 31" src="https://github.com/JonasStjerne/P7/assets/73853586/19c29ad2-f339-48b3-992c-4be7e1307814">
</p>
