document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const points = []; // Store points A, B, and C
    let thirdPoint = null; // Track the third point separately
    const linesToDraw = [];
    const completedLines = [];
    const completedArcs = [];
    const refreshButton = document.getElementById('refreshButton');
    let draggingPoint = null; // Track the point being dragged
    let linesCompleted = false; // Track if the lines are completely drawn
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    document.body.appendChild(tooltip);

    // Set up the video background
    const video = document.createElement('video');
    video.src = 'assets/images/bg_main.mp4';
    video.autoplay = true;
    video.loop = true;
    video.muted = true; // Mute the video to allow autoplay in most browsers
    video.style.position = 'absolute';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.zIndex = '-1';
    canvas.parentNode.insertBefore(video, canvas);

    const imgPointA = new Image();
    imgPointA.src = 'assets/images/proc.png';

    const imgPointB = new Image();
    imgPointB.src = 'assets/images/proc.png';

    const animalImages = [
        'assets/images/animals/boar.png',
        'assets/images/animals/deer.png',
        'assets/images/animals/elephant.png',
        'assets/images/animals/fox.png',
        'assets/images/animals/wild-boar.png',
        'assets/images/animals/lion.png',
        'assets/images/animals/tiger.png',
        'assets/images/animals/wolf.png',
    ];

    function getRandomAnimalImage() {
        const randomIndex = Math.floor(Math.random() * animalImages.length);
        return animalImages[randomIndex];
    }

    let imgPointC = new Image();
    imgPointC.src = getRandomAnimalImage();

    video.play().catch(error => {
        console.log('Error playing the video:', error);
    });

    function updateCanvas() {
        if (video.readyState >= 2) {  // Ensure video is ready enough to display
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        drawAllPointsAndLabels();
        drawCompletedLines();
        drawCompletedArcs();
        processLineDrawing();
        requestAnimationFrame(updateCanvas); // Continue updating the canvas
    }

    refreshButton.addEventListener('click', () => {
        location.reload();
    });

    canvas.addEventListener('mousedown', function (event) {
        const rect = canvas.getBoundingClientRect(); // Get the bounding rectangle of the canvas
        const scaleX = canvas.width / rect.width;    // Relationship bitmap vs. element for X
        const scaleY = canvas.height / rect.height;  // Relationship bitmap vs. element for Y

        const x = (event.clientX - rect.left) * scaleX; // Scale mouse coordinates after they have
        const y = (event.clientY - rect.top) * scaleY;  // been adjusted to be relative to element

        // Check if the mouse is down on point A or point B
        if (points.length >= 2) {
            if (Math.abs(x - points[0].x) < 10 && Math.abs(y - points[0].y) < 10) {
                draggingPoint = 0;
            } else if (Math.abs(x - points[1].x) < 10 && Math.abs(y - points[1].y) < 10) {
                draggingPoint = 1;
            }
        }
    });

    canvas.addEventListener('mousemove', function (event) {
        if (draggingPoint !== null) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;

            const x = (event.clientX - rect.left) * scaleX;

            points[draggingPoint].x = x;

            // Recalculate the triangle properties and redraw everything
            if (points.length === 3) {
                calculateTriangleProperties();
            }
        }
    });

    canvas.addEventListener('mouseup', function () {
        draggingPoint = null;
    });

    canvas.addEventListener('click', function (event) {
        if (draggingPoint !== null) return; // Ignore clicks when dragging
        if (!linesCompleted && points.length >= 3) return; // Ignore additional clicks if lines are not completed

        const rect = canvas.getBoundingClientRect(); // Get the bounding rectangle of the canvas
        const scaleX = canvas.width / rect.width;    // Relationship bitmap vs. element for X
        const scaleY = canvas.height / rect.height;  // Relationship bitmap vs. element for Y

        const x = (event.clientX - rect.left) * scaleX; // Scale mouse coordinates after they have
        const y = (event.clientY - rect.top) * scaleY;  // been adjusted to be relative to element

        if (y > 380 && points.length < 2) {
            points.push({ x, y });
            if (points.length === 2) {
                // Draw line between the first two points
                enqueueLineDraw(points[0], points[1]);
                calculateTriangleProperties(); // Calculate and display distance immediately
            }
        } else if (y < 275) { // Only allow new points above the vertical pixel point 170
            // Clear previous third point, lines, and arcs if a new point is clicked
            if (thirdPoint) {
                points.splice(2, 1);
                thirdPoint = null;
                completedLines.splice(-2);
                completedArcs.splice(-2);
            }

            // Add new third point
            thirdPoint = { x, y };
            points[2] = thirdPoint;

            // Load a new random animal image
            imgPointC.src = getRandomAnimalImage();

            // Draw lines from points A and B to the new point
            enqueueLineDraw(points[0], points[2]);
            enqueueLineDraw(points[1], points[2]);
            calculateTriangleProperties();
        }
    });

    function drawAllPointsAndLabels() {
        if (points.length > 1) {
            drawProtractors(points[0], points[1], imgPointA, 'Observer A');
        }
    
        // Draw remaining points and labels
        points.forEach((point, index) => {
            if (index >= 0) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fill();
    
                let label;
                if (index === 0) {
                    label = 'Observer A';
                } else if (index === 1) {
                    label = 'Observer B';
                } else if (index === 2) {
                    label = 'Target';
                } else {
                    label = `Point ${index}`;
                }
                
                if (index === 2) {
                    drawLabel(point, label, 25); // Offset Target label 25 points to the right
                } else {
                    drawLabel(point, label);
                }
    
                if (index === 2) {
                    ctx.drawImage(imgPointC, point.x - 25, point.y - 25, 50, 50);
                }
            }
    
            // Update display for each point
            updatePointDisplay(index, point);
        });
    
        updateAdditionalPointsInfo(); // Update the results with new point info
    }
    
    function drawLabel(point, label, offsetX = 0) {
        ctx.fillStyle = 'black';
        ctx.font = '18px Arial';
        ctx.fillText(label, point.x + offsetX, point.y + 20);
        // Store the label's position for tooltip
        point.label = label;
    }    

    function drawCompletedLines() {
        completedLines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.start.x, line.start.y);
            ctx.lineTo(line.end.x, line.end.y);
            ctx.stroke();
            drawLineLabel(line);
    
            // Draw arrowheads for all lines
            if ((points[0] === line.start && points[1] === line.end) || 
                (points[1] === line.start && points[0] === line.end)) {
                drawArrowhead(line.start, line.end);
                drawArrowhead(line.end, line.start);
            } else if ((points[0] === line.start && points[2] === line.end) || 
                (points[1] === line.start && points[2] === line.end)) {
                drawArrowhead(line.start, line.end);
            }
        });
    }
    

    function drawLineLabel(line) {
        const midX = (line.start.x + line.end.x) / 2;
        const midY = (line.start.y + line.end.y) / 2;

        ctx.fillStyle = 'black';
        ctx.font = '18px Arial';

        if (line.label) {
            if (line.label === 'dAB') {
                ctx.fillText(line.label, midX, midY + 15);
            } else if (line.label === 'rAT') {
                ctx.fillText(line.label, midX - 30, midY)
            } else if (line.label === 'rBT') {
                ctx.fillText(line.label, midX + 7, midY);
            }
        }
    }
    
    function processLineDrawing() {
        // linesCompleted = false;
        if (!linesToDraw.length) return;
        let line = linesToDraw[0];

        if (line.step <= line.numSteps) {
            
            ctx.beginPath();
            ctx.moveTo(line.start.x, line.start.y);
            ctx.lineTo(line.currentX, line.currentY);
            ctx.stroke();

            line.currentX += line.deltaX;
            line.currentY += line.deltaY;
            line.step++;
        } else {
            completedLines.push({ start: line.start, end: line.end, label: line.label }); // Add to completed lines
            linesToDraw.shift(); // Remove line from queue after drawing
            drawLineLabel({ start: line.start, end: line.end, label: line.label }); // Draw label after line is fully drawn
            drawArrowhead(line.start, line.end); // Draw arrow at start and end
            if (line.label !== 'dAB') {
                drawArrowhead(line.end, line.start); // Draw another arrow at the end for 'rAT' and 'rBT'
            }
            // Draw curved arrows at points A and B after lines are drawn
            if (!linesToDraw.length) {
                if (points[2]) {
                    completedArcs.push({ center: points[0], pointA: points[1], pointB: points[2], direction: 'left' });
                    completedArcs.push({ center: points[1], pointA: points[0], pointB: points[2], direction: 'right' });
                }
                linesCompleted = true; // Mark lines as completed
            }
        }
        
        // linesCompleted = true;
    }

    function enqueueLineDraw(start, end, numSteps = 100) {
        let deltaX = (end.x - start.x) / numSteps;
        let deltaY = (end.y - start.y) / numSteps;

        linesToDraw.push({
            start: start,
            end: end,
            currentX: start.x,
            currentY: start.y,
            deltaX: deltaX,
            deltaY: deltaY,
            step: 0,
            numSteps: numSteps,
            label: getLabel(start, end) // Assign the label to the line
        });
    }

    function getLabel(start, end) {
        if (points[0] === start && points[1] === end) {
            return 'dAB';
        } else if (points[0] === start && points[2] === end) {
            return 'rAT';
        } else if (points[1] === start && points[2] === end) {
            return 'rBT';
        }
        return '';
    }

    function drawProtractors(point1, point2, img, label) {
        const size = 241; // Set the desired size of the protractor

        // Calculate the angle between Point A and Point B
        const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);

        ctx.save(); // Save the current canvas state
        ctx.translate(point1.x, point1.y); // Translate to the center of the protractor
        ctx.rotate(angle); // Rotate the canvas
        ctx.drawImage(img, -size / 2 + 1, -122, 241, 135); // Draw the protractor
        ctx.restore(); // Restore the saved canvas state

        ctx.save(); // Save the current canvas state
        ctx.translate(point2.x, point2.y); // Translate to the center of the protractor
        ctx.rotate(angle); // Rotate the canvas
        ctx.drawImage(img, -size / 2 + 1, -122, 241, 135); // Draw the protractor
        ctx.restore(); // Restore the saved canvas state

        drawLabel(point1, label);
    }

    function updateAdditionalPointsInfo() {
        const resultsContainer = document.getElementById('outputContainer');
        // Clear specific entries related to dynamically added points (4th onwards) to avoid duplication
        let dynamicEntries = resultsContainer.querySelectorAll('.dynamic-entry');
        dynamicEntries.forEach(entry => entry.remove());

        if (points.length === 3) {
            const point = points[2];
            const distFromA = calculateDistance(point, points[0]).toFixed(2);
            const distFromB = calculateDistance(point, points[1]).toFixed(2);
        }
    }

    function updatePointDisplay(index, point) {
        const outputs = [document.getElementById('pointA'), document.getElementById('pointB'), document.getElementById('pointC')];
        if (index < outputs.length) {
            outputs[index].value = `(${point.x.toFixed(0)}, ${point.y.toFixed(0)})`;
        }
    }

    function calculateTriangleProperties() {
        if (points.length < 2) return;

        const a = points[0], b = points[1], c = points[2] || { x: 0, y: 0 };
        const [AB, AC, BC] = [calculateDistance(a, b), calculateDistance(a, c), calculateDistance(b, c)];

        // Calculate the angle between the line AB and the x-axis
        const angleAB = Math.atan2(b.y - a.y, b.x - a.x);

        // Calculate the angles at points A and B
        const angleA = points.length === 3 ? angleAB - Math.atan2((c.y - a.y), (c.x - a.x)) : 0;
        const angleB = points.length === 3 ? Math.atan2(-(c.y - b.y), -(c.x - b.x)) - angleAB : 0;

        // Update the HTML elements with the calculated values
        document.getElementById('distanceAB').value = AB.toFixed(2);
        if (points.length === 3) {
            document.getElementById('distanceAC').value = AC.toFixed(2);
            document.getElementById('distanceBC').value = BC.toFixed(2);
            document.getElementById('angle1Output').value = (angleA * 180 / Math.PI).toFixed(2);
            document.getElementById('angle2Output').value = (angleB * 180 / Math.PI).toFixed(2);
        }

        // Assign labels to the lines
        completedLines.forEach((line, index) => {
            if (index === 0) {
                line.label = 'dAB';
            } else if (index === 1) {
                line.label = 'rAT';
            } else if (index === 2) {
                line.label = 'rBT';
            }
        });

        // Draw angle labels on the arcs
        if (points.length === 3) {
            drawAngleLabel(points[0], angleA, 'θA', 'right');
            drawAngleLabel(points[1], angleB, 'θB', 'left');
        }
    }

    function calculateDistance(p1, p2) {
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }

    function drawArc(center, pointA, pointB, direction) {
        const angleStart = Math.atan2(pointA.y - center.y, pointA.x - center.x);
        const angleEnd = Math.atan2(pointB.y - center.y, pointB.x - center.x);
        const clockwise = direction === 'right' ? false : true;
    
        ctx.beginPath();
        ctx.arc(center.x, center.y, 50, angleStart, angleEnd, clockwise);
        ctx.stroke();
    
        // Draw arrowhead at the start of the arc
        const arrowStart = {
            x: center.x + 50 * Math.cos(angleStart),
            y: center.y + 50 * Math.sin(angleStart)
        };
        drawArcArrowhead(arrowStart, angleStart, clockwise, false);
    
        // Draw arrowhead at the end of the arc
        const arrowEnd = {
            x: center.x + 50 * Math.cos(angleEnd),
            y: center.y + 50 * Math.sin(angleEnd)
        };
        drawArcArrowhead(arrowEnd, angleEnd, clockwise, true);
    }
    
    function drawArcArrowhead(point, angle, clockwise, isEnd) {
        const headLength = 10; // Length of the arrowhead
        const headAngle = Math.PI / 6; // Angle of the arrowhead
    
        // Adjust angle direction for the end arrowhead to be opposite
        const angleOffset = clockwise ? Math.PI / 2 : -Math.PI / 2;
        const adjustedAngle = isEnd ? angle + Math.PI : angle;
    
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(
            point.x - headLength * Math.cos(adjustedAngle + headAngle + angleOffset),
            point.y - headLength * Math.sin(adjustedAngle + headAngle + angleOffset)
        );
        ctx.lineTo(
            point.x - headLength * Math.cos(adjustedAngle - headAngle + angleOffset),
            point.y - headLength * Math.sin(adjustedAngle - headAngle + angleOffset)
        );
        ctx.closePath();
        ctx.fill(); // Fill the arrowhead
    }
    
    // Modified drawArrowhead function for lines
    function drawArrowhead(from, to) {
        const headLength = 10; // Adjust the size of the arrowhead
        const headAngle = Math.PI / 6; // Angle of the arrowhead

        const angle = Math.atan2(to.y - from.y, to.x - from.x);

        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
            to.x - headLength * Math.cos(angle - headAngle),
            to.y - headLength * Math.sin(angle - headAngle)
        );
        ctx.lineTo(
            to.x - headLength * Math.cos(angle + headAngle),
            to.y - headLength * Math.sin(angle + headAngle)
        );
        ctx.closePath();
        ctx.fill(); // Fill the arrowhead
    }

    // Tooltip functionality
    function showTooltip(x, y, text) {
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
        tooltip.style.display = 'block';
        tooltip.textContent = text;
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        let found = false;
        points.forEach(point => {
            const labelX = point.x;
            const labelY = point.y + 20;

            if (x > labelX - 10 && x < labelX + 40 && y > labelY - 10 && y < labelY + 20) {
                showTooltip(event.clientX + 10, event.clientY + 10, `Coordinates: (${point.x.toFixed(0)}, ${point.y.toFixed(0)})`);
                found = true;
            }
        });

        if (!found) {
            hideTooltip();
        }
    });

    function drawCompletedArcs() {
        completedArcs.forEach(arc => {
            drawArc(arc.center, arc.pointA, arc.pointB, arc.direction);
            if (arc.direction === 'left') {
                drawAngleLabel(arc.center, arc.pointA, arc.pointB, 'θA', 'right');
            } else {
                drawAngleLabel(arc.center, arc.pointA, arc.pointB, 'θB', 'left');
            }
        });
    }

    function drawAngleLabel(center, pointA, pointB, label, direction) {
        const radius = 60;
        const angleOffset = Math.PI / 6; // Offset to position the label away from the arc

        const angle = Math.atan2(pointB.y - center.y, pointB.x - center.x);
        let x, y;
        if (direction === 'right') {
            x = center.x + radius * Math.cos(angle + angleOffset);
            y = center.y + radius * Math.sin(angle + angleOffset) + 5;
        } else {
            x = center.x + radius * Math.cos(angle - angleOffset) - 10;
            y = center.y + radius * Math.sin(angle - angleOffset); // Adjust y for 'θB' to place it above the line
        }

        ctx.fillStyle = 'black';
        ctx.font = '18px Arial';
        ctx.fillText(label, x, y);
    }

    updateCanvas();  // Start the animation loop
});

