const express = require("express");
const promMid = require('express-prometheus-middleware');

const PORT = 3001; // server runs on port 3001 

const app = express();

/**
 * Authentication Function
 * This function checks for the correct authorization header included in the API requests 
 */
function authentication(req, res, next) {
    var authHeader = req.headers.authorization; // gets the value for authorization header
    if (authHeader !== 'mysecrettoken') return res.sendStatus(403); // returns 403 code if authorization fails
    return next();
}

app.use(authentication); // authentication check for all API requests

/**
 * Metrics Middleware
 * @api {get} /metrics
 * @description Returns all available Prometheus-format metrics for the API
 */
app.use(promMid({
    metricsPath: '/metrics',
    collectDefaultMetrics: true, // collects default metrics
    requestDurationBuckets: [0.1, 0.5, 1, 1.5], // histogram buckets for the request duration metrics in seconds
    requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400], // histogram buckets for the request length in bytes
    responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400], // histogram buckets for the response length metrics in bytes
}));

/**
 * Time Endpoint
 * @api {get} /time
 * @apiDescription Returns the current server time in epoch seconds
 */
app.get("/time", (req, res) => {
    const now = new Date(); // current date
    const epochSeconds = Math.round(now.getTime() / 1000); // converts epoch date to seconds
    res.json({ epoch: epochSeconds }); // returns json object containing epoch seconds
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
