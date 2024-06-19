# Triangulation for Target Range Estimation

## Overview

This project is a web application that allows users to estimate the range to a target using triangulation. By setting two observer points and a target point on a canvas, the application calculates and displays the coordinates, distances, and angles between these points.

## Features

- Set initial observer points (Observer A and Observer B) on a canvas.
- Calculate and display the coordinates and distance between the observers.
- Set a target point to form a triangle with the observers.
- Calculate and display the angles at Observer A (θ<sub>A</sub>) and Observer B (θ<sub>B</sub>).
- Calculate and display the distances from each observer to the target.
- Allow additional target points to be added dynamically, with real-time calculation of distances from the observers.
- Display the results in a user-friendly format with a read-only text box for each calculated value.
- Video background for the canvas to enhance the visual appeal.
- Tooltip functionality to display coordinates when hovering over the points.

## Instructions

1. **Set Observer Points:**
   - Click on the grassy area of the canvas to set Observer A and Observer B.
   - The coordinates and distance between these points will be displayed immediately.
   - Observers A and B can be moved horizontally by dragging them.

2. **Set Target Point:**
   - Click on the land above the water to set a target point, forming a triangle with the observers.
   - The application will calculate and display the angles at Observer A (θ<sub>A</sub>) and Observer B (θ<sub>B</sub>), as well as the distances from each observer to the target.

3. **Add Additional Points:**
   - Once all lines are completely drawn, you can click to add additional target points.
   - Lines will be dynamically drawn from Observers A and B to these new points, and the distances will be calculated and displayed in real-time.

## Project Structure

### HTML

The HTML file defines the structure of the webpage, including the canvas for drawing points and lines, and the output container for displaying the results. The results are neatly organized, and a button is provided to refresh the page.

### CSS

The CSS file styles the webpage, ensuring a clean and responsive layout. Key styles include:

- Grid layout for the main container to separate the canvas and the results section.
- Rounded corners and borders for the canvas and result containers.
- Consistent color scheme using blue for borders and text.
- Tooltip styling for displaying coordinates when hovering over points.
- Responsive design to ensure usability on different screen sizes.

### JavaScript

The JavaScript file implements the core functionality, including:

- Setting and dragging points on the canvas.
- Calculating distances and angles.
- Drawing lines and updating the canvas in real-time.
- Handling user interactions and displaying results.
- Ensuring additional points can only be added after the initial lines are completely drawn.

## Media

The application enhances visual representation using images and videos. A looping video provides a dynamic background. Icons represent the observers at initial points set by the user. A random animal image appears at the target point. Protractors are drawn at the observer points to visualize the angles formed.

## Usage

To use the application, follow the instructions to set the points and observe the calculated results in real-time. The application is designed to be intuitive and provides immediate feedback as points are added and moved. The results are displayed in a read-only format to ensure accuracy and ease of interpretation.

## Conclusion

This project demonstrates the practical application of triangulation for target range estimation in a visually appealing and interactive manner. Utilizing HTML, CSS, and JavaScript, the application offers an engaging user experience while illustrating the principles of geometry and distance calculation.
