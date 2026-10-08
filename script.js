// =====================================================
// DISASTER EVACUATION ROUTE PLANNER
// =====================================================


// =====================================================
// GRAPH
// =====================================================
//
// The graph represents roads between locations.
// Each edge contains a distance value.
//
// Example:
//
// A ----5---- B ----4---- C
//
// Dijkstra's algorithm uses these weights to
// find the shortest route.
//

const graph = {

    A: {
        B: 5
    },

    B: {
        A: 5,
        C: 4,
        E: 6
    },

    C: {
        B: 4,
        D: 3,
        F: 5
    },

    D: {
        C: 3,
        F: 4
    },

    E: {
        B: 6,
        F: 3,
        G: 4
    },

    F: {
        C: 5,
        D: 4,
        E: 3,
        H: 5
    },

    G: {
        E: 4,
        F: 8
    },

    H: {
        F: 5,
        D: 7
    }

};


// =====================================================
// NODE INFORMATION
// =====================================================

const nodes = {

    A: {
        name: "North Emergency",
        type: "Emergency"
    },

    B: {
        name: "Central Junction",
        type: "Junction"
    },

    C: {
        name: "East Junction",
        type: "Junction"
    },

    D: {
        name: "Central Safe Zone",
        type: "Safe"
    },

    E: {
        name: "West Junction",
        type: "Junction"
    },

    F: {
        name: "South Junction",
        type: "Junction"
    },

    G: {
        name: "South Emergency",
        type: "Emergency"
    },

    H: {
        name: "South Safe Zone",
        type: "Safe"
    }

};


// =====================================================
// EMERGENCY LOCATIONS
// =====================================================

const emergencies = [

    {
        id: 1,

        node: "A",

        name: "North Industrial Area",

        severity: "Critical",

        people: 320,

        description:
            "Major fire reported near industrial buildings."
    },


    {
        id: 2,

        node: "G",

        name: "South Residential Area",

        severity: "High",

        people: 210,

        description:
            "Flooding has affected residential streets."
    },


    {
        id: 3,

        node: "C",

        name: "East Market Area",

        severity: "Medium",

        people: 140,

        description:
            "Smoke and road blockage reported."
    }

];


// =====================================================
// SAFE ZONES
// =====================================================

const safeZones = [

    {
        node: "D",

        name: "Central Stadium",

        capacity: 800,

        available: 620
    },


    {
        node: "H",

        name: "South Community Hall",

        capacity: 500,

        available: 340
    }

];


// =====================================================
// PRIORITY VALUES
// =====================================================

const priorityValue = {

    Critical: 1,

    High: 2,

    Medium: 3,

    Low: 4

};


// =====================================================
// DIJKSTRA'S SHORTEST PATH ALGORITHM
// =====================================================

function dijkstra(
    graph,
    start,
    target
) {

    const distances = {};

    const previous = {};

    const unvisited = new Set(
        Object.keys(graph)
    );


    // Initialize distances

    for (
        const node of unvisited
    ) {

        distances[node] =
            Infinity;

        previous[node] =
            null;

    }


    distances[start] = 0;


    while (
        unvisited.size > 0
    ) {

        // Find closest unvisited node

        let current = null;

        let shortestDistance =
            Infinity;


        for (
            const node of unvisited
        ) {

            if (
                distances[node] <
                shortestDistance
            ) {

                shortestDistance =
                    distances[node];

                current = node;
            }

        }


        // No reachable nodes

        if (
            current === null
        ) {

            break;
        }


        // Target reached

        if (
            current === target
        ) {

            break;
        }


        unvisited.delete(
            current
        );


        // Update neighbors

        for (
            const neighbor in
            graph[current]
        ) {

            const weight =
                graph[current][neighbor];


            const newDistance =
                distances[current] +
                weight;


            if (
                newDistance <
                distances[neighbor]
            ) {

                distances[neighbor] =
                    newDistance;

                previous[neighbor] =
                    current;
            }

        }

    }


    // Build route

    const path = [];

    let current = target;


    while (
        current !== null
    ) {

        path.unshift(
            current
        );

        current =
            previous[current];
    }


    if (
        path.length === 1 &&
        start !== target
    ) {

        return null;
    }


    return {

        distance:
            distances[target],

        path:
            path

    };

}


// =====================================================
// FIND CLOSEST SAFE ZONE
// =====================================================

function findClosestSafeZone(
    start
) {

    let bestRoute = null;

    let bestZone = null;


    safeZones.forEach(
        zone => {

            const result =
                dijkstra(
                    graph,
                    start,
                    zone.node
                );


            if (
                result &&
                (
                    bestRoute === null ||
                    result.distance <
                    bestRoute.distance
                )
            ) {

                bestRoute =
                    result;

                bestZone =
                    zone;
            }

        }
    );


    if (!bestRoute) {

        return null;
    }


    return {

        zone:
            bestZone,

        route:
            bestRoute

    };

}


// =====================================================
// CALCULATE ROUTE BUTTON
// =====================================================

function calculateRoute() {

    const start =
        document.getElementById(
            "startNode"
        ).value;


    const end =
        document.getElementById(
            "endNode"
        ).value;


    const result =
        dijkstra(
            graph,
            start,
            end
        );


    const output =
        document.getElementById(
            "routeResult"
        );


    if (!result) {

        output.innerHTML =
            "❌ No route is available.";

        return;
    }


    const routeNames =
        result.path.map(
            node =>
                nodes[node].name
        );


    output.innerHTML = `

        <strong>
            ✅ Shortest Evacuation Route Found
        </strong>

        <br><br>

        <strong>
            Route:
        </strong>

        ${result.path.join(
            " → "
        )}

        <br>

        <strong>
            Locations:
        </strong>

        ${routeNames.join(
            " → "
        )}

        <br>

        <strong>
            Distance:
        </strong>

        ${result.distance} km

        <br>

        <strong>
            Estimated Time:
        </strong>

        ${estimateTime(
            result.distance
        )} minutes

        <br><br>

        🛡️ Follow the highlighted route
        toward the selected safe zone.

    `;


    highlightRoute(
        result.path
    );


    document
        .getElementById(
            "map"
        )
        .scrollIntoView({
            behavior: "smooth"
        });
}


// =====================================================
// ESTIMATE EVACUATION TIME
// =====================================================

function estimateTime(
    distance
) {

    // Average evacuation speed
    // assumed as 30 km/h.

    return Math.ceil(
        distance * 2
    );
}


// =====================================================
// HIGHLIGHT ROUTE
// =====================================================

function highlightRoute(
    path
) {

    const coordinates = {

        A: [100,100],

        B: [300,100],

        C: [500,180],

        D: [720,120],

        E: [350,300],

        F: [550,350],

        G: [180,430],

        H: [820,450]

    };


    const svg =
        document.querySelector(
            ".network-map svg"
        );


    const routeLine =
        document.getElementById(
            "routeLine"
        );


    const rect =
        svg.getBoundingClientRect();


    const svgWidth =
        1000;


    const svgHeight =
        560;


    const points =
        path.map(
            node => {

                const [
                    x,
                    y
                ] =
                    coordinates[node];

                return `${x},${y}`;
            }
        );


    routeLine.setAttribute(
        "points",
        points.join(" ")
    );


    // Reset node highlighting

    document
        .querySelectorAll(
            ".map-node"
        )
        .forEach(
            element => {

                element.style.boxShadow =
                    "0 5px 15px rgba(0,0,0,.4)";
            }
        );


    // Highlight route nodes

    path.forEach(
        node => {

            const element =
                document.getElementById(
                    `node-${node}`
                );


            if (element) {

                element.style.boxShadow =
                    "0 0 20px #22c55e";

            }

        }
    );

}


// =====================================================
// DISPLAY EMERGENCIES
// =====================================================

function displayEmergencies() {

    const container =
        document.getElementById(
            "emergencyList"
        );


    container.innerHTML = "";


    emergencies.forEach(
        emergency => {

            const closest =
                findClosestSafeZone(
                    emergency.node
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "emergency-card";


            card.innerHTML = `

                <span
                    class="priority-badge
                    ${getPriorityClass(
                        emergency.severity
                    )}"
                >
                    ${emergency.severity}
                </span>


                <h3>
                    🚨
                    ${escapeHTML(
                        emergency.name
                    )}
                </h3>


                <p>
                    📍 Node:
                    <strong>
                        ${emergency.node}
                    </strong>
                </p>


                <p>
                    👥 People affected:
                    <strong>
                        ${emergency.people}
                    </strong>
                </p>


                <p>
                    ${escapeHTML(
                        emergency.description
                    )}
                </p>


                ${
                    closest

                    ?

                    `
                    <p>
                        🛡️ Nearest Safe Zone:
                        <strong>
                            ${closest.zone.name}
                        </strong>
                    </p>

                    <p>
                        🛣️ Distance:
                        <strong>
                            ${closest.route.distance}
                            km
                        </strong>
                    </p>
                    `

                    :

                    ""
                }

            `;


            container.appendChild(
                card
            );

        }
    );

}


// =====================================================
// DISPLAY SAFE ZONES
// =====================================================

function displaySafeZones() {

    const container =
        document.getElementById(
            "safeZoneList"
        );


    container.innerHTML = "";


    safeZones.forEach(
        zone => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "safe-card";


            card.innerHTML = `

                <h3>
                    🛡️
                    ${escapeHTML(
                        zone.name
                    )}
                </h3>


                <p>
                    📍 Node:
                    ${zone.node}
                </p>


                <p>
                    👥 Capacity:
                    ${zone.capacity}
                </p>


                <p>
                    🟢 Available:
                    <strong>
                        ${zone.available}
                    </strong>
                </p>


                <p>
                    📊 Occupancy:
                    ${
                        zone.capacity -
                        zone.available
                    }
                    /
                    ${zone.capacity}
                </p>

            `;


            container.appendChild(
                card
            );

        }
    );

}


// =====================================================
// PRIORITY QUEUE
// =====================================================
//
// Critical → High → Medium → Low
//
// If two emergencies have the same
// priority, the larger affected population
// is processed first.
//

function displayPriorityQueue() {

    const container =
        document.getElementById(
            "priorityQueue"
        );


    const queue =
        [...emergencies].sort(
            (
                a,
                b
            ) => {

                const priorityDifference =

                    priorityValue[
                        a.severity
                    ]

                    -

                    priorityValue[
                        b.severity
                    ];


                if (
                    priorityDifference !==
                    0
                ) {

                    return priorityDifference;
                }


                return (
                    b.people -
                    a.people
                );

            }
        );


    container.innerHTML = "";


    queue.forEach(
        (
            emergency,
            index
        ) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "priority-item";


            item.innerHTML = `

                <div class="priority-left">

                    <span class="rank">
                        ${index + 1}
                    </span>


                    <div>

                        <strong>
                            ${escapeHTML(
                                emergency.name
                            )}
                        </strong>

                        <p>
                            ${emergency.people}
                            people affected
                        </p>

                    </div>

                </div>


                <span
                    class="priority-badge
                    ${getPriorityClass(
                        emergency.severity
                    )}"
                >
                    ${emergency.severity}
                </span>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// =====================================================
// PRIORITY CLASS
// =====================================================

function getPriorityClass(
    priority
) {

    switch (priority) {

        case "Critical":
            return "critical";

        case "High":
            return "high";

        case "Medium":
            return "medium";

        default:
            return "low";

    }

}


// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard() {

    document.getElementById(
        "emergencyCount"
    ).textContent =
        emergencies.length;


    document.getElementById(
        "safeZoneCount"
    ).textContent =
        safeZones.length;


    document.getElementById(
        "routeCount"
    ).textContent =
        emergencies.length;


    const highPriority =
        emergencies.filter(
            emergency =>

                emergency.severity ===
                "Critical"

                ||

                emergency.severity ===
                "High"
        ).length;


    document.getElementById(
        "highPriorityCount"
    ).textContent =
        highPriority;

}


// =====================================================
// SECURITY HELPER
// =====================================================

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// INITIALIZE APPLICATION
// =====================================================

updateDashboard();

displayEmergencies();

displaySafeZones();

displayPriorityQueue();
