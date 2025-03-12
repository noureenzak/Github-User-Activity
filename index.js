const https = require("https"); // Import Node.js built-in https module

// Access the username from command-line arguments
const username = process.argv[2];

// Check if the user provided a GitHub username
if (!username) {
    console.log("Usage: node index.js <GitHub-Username>");
    process.exit(1); // Exit if no username is provided
}

// GitHub API URL for fetching user activity
const url = `https://api.github.com/users/${username}/events`;

const options = {
    headers: {
        "User-Agent": "node.js", // Required by GitHub API
    },
};

// Make the HTTPS request
https.get(url, options, (res) => {
    let data = "";

    // Receive data in chunks
    res.on("data", (chunk) => {
        data += chunk;
    });

    // When all data is received
    res.on("end", () => {
        if (res.statusCode !== 200) {
            console.error(`Error: Unable to fetch data (Status Code: ${res.statusCode})`);
            return;
        }

        try {
            const events = JSON.parse(data); // Convert JSON string to an object

            if (events.length === 0) {
                console.log("No recent activity found.");
                return;
            }

            console.log(`Recent activity of ${username}:`);

            // Display the first 5 activities
            events.slice(0, 5).forEach((event) => {
                const { type, repo } = event;
                let action = "";

                switch (type) {
                    case "PushEvent":
                        action = `Pushed commits to ${repo.name}`;
                        break;
                    case "IssuesEvent":
                        action = `Opened a new issue in ${repo.name}`;
                        break;
                    case "WatchEvent":
                        action = `Starred ${repo.name}`;
                        break;
                    case "ForkEvent":
                        action = `Forked ${repo.name}`;
                        break;
                    default:
                        action = `Performed ${type} on ${repo.name}`;
                }

                console.log(`- ${action}`);
            });
        } catch (error) {
            console.error("Error parsing JSON response:", error.message);
        }
    });
}).on("error", (err) => {
    console.error("Request failed:", err.message);
});
