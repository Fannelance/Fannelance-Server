const express = require("express");
const bodyParser = require("body-parser");
const http = require("http"); // Required to create an HTTP server
const userRoute = require("./routes/user.routes");
const serviceRoute = require("./routes/service.routes");
const OTPRoute = require("./routes/otp.routes");
const workerRoute = require("./routes/worker.routes");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const WorkerView = require("./views/worker.views");
const jwt = require("jsonwebtoken");
const UserView = require("./views/user.views");
const RequestView = require("./views/request.views");
var ObjectId = require("mongoose").Types.ObjectId;

const JWT_SECRET_KEY_USER = process.env.JWT_SECRET_KEY_USER;
const JWT_SECRET_KEY_WORKER = process.env.JWT_SECRET_KEY_WORKER;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());

app.use("/", userRoute);
app.use("/", serviceRoute);
app.use("/", OTPRoute);
app.use("/", workerRoute);

const connectedWorkersMap = new Map(); // To track connected workers and their sockets

io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);

  const lastSentWorkersMap = new Map();
  const intervalMap = new Map();

  socket.on("available-workers", async (token, jobTitle) => {
    try {
      const decoded = jwt.verify(
        token.replace("Bearer ", ""),
        JWT_SECRET_KEY_USER
      );

      const user = await UserView.checkUser(decoded.phone);
      const userLocation = user.location.coordinates;
      const userId = user._id;

      console.log("User ID:", userId);

      // Function to fetch and emit only new workers
      const fetchAndEmitNewWorkers = async () => {
        try {
          const currentWorkers = await WorkerView.findSuitableWorkers(
            userLocation,
            jobTitle
          );

          const lastSentWorkers = lastSentWorkersMap.get(userId) || [];

          // Find new workers by comparing current and last sent workers
          const newWorkers = currentWorkers.filter(
            (worker) =>
              !lastSentWorkers.some((lastWorker) =>
                lastWorker._id.equals(worker._id)
              )
          );

          // Update the last sent workers map with the current workers
          lastSentWorkersMap.set(userId, currentWorkers);

          if (newWorkers.length > 0) {
            console.log("New workers to emit:", newWorkers);
            socket.emit("send-workers", newWorkers);
          } else {
            console.log("No new workers to emit.");
          }
        } catch (error) {
          console.error("Error fetching workers:", error);
        }
      };

      // Clear any existing interval for this user to avoid duplicates
      if (intervalMap.has(userId)) {
        clearInterval(intervalMap.get(userId));
      }

      socket.on("timeout", async (workerId) => {
        try {
          const worker = new ObjectId(workerId);

          await WorkerView.updateWorkerAvailability(worker, true);
        } catch (error) {
          console.error("Error handling timeout:", error);
        }
      });

      socket.on("stop-fetching-workers", () => {
        if (intervalMap.has(userId)) {
          clearInterval(intervalMap.get(userId));
          intervalMap.delete(userId);
        }
        lastSentWorkersMap.delete(userId);
      });

      socket.on("disconnect", () => {
        if (intervalMap.has(userId)) {
          clearInterval(intervalMap.get(userId));
          intervalMap.delete(userId);
        }

        lastSentWorkersMap.delete(userId);
        console.log("User disconnected:", userId);
      });

      const intervalId = setInterval(fetchAndEmitNewWorkers, 1000);

      intervalMap.set(userId, intervalId);
    } catch (error) {
      console.error("Error handling available-workers event:", error);
    }
  });

  socket.on("send-request", async (token, workerId) => {
    try {
      const decoded = jwt.verify(
        token.replace("Bearer ", ""),
        JWT_SECRET_KEY_USER
      );
      const user = await UserView.getUserData(decoded.phone);
      socket.broadcast.emit("chosen-worker", workerId);
      const worker = new ObjectId(workerId);

      console.log("Request for", workerId);
      await WorkerView.updateWorkerAvailability(worker, false);

      console.log("User data for the request:", user);

      const requestData = {
        status: "Open",
        requester: user._id,
        assigned_to: worker,
      };

      const request = await RequestView.createRequest(requestData);
      console.log(request);

      socket.broadcast.emit(`request-${workerId}`, {
        user: user,
        request: request,
      });
    } catch (error) {
      console.error("Error handling selected-worker event:", error);
    }
  });

  socket.on(`accept-request`, async (request) => {
    console.log("Request accepted:", request);
    const requestId = new ObjectId(request._id);
    await RequestView.updateRequestStatus(requestId, "In Progress");
    await WorkerView.withdraw(request.assigned_to, 10);

    socket.broadcast.emit(`request-${request.requester}`);
    await WorkerView.updateWorkerAvailability(
      new ObjectId(request.assigned_to),
      true
    );
  });

  socket.on("connected-worker", async (token, isAvailable) => {
    try {
      const decoded = jwt.verify(
        token.replace("Bearer ", ""),
        JWT_SECRET_KEY_WORKER
      );
      const workerId = decoded._id;

      if (!isAvailable) {
        console.log("Worker connected:", isAvailable);
        socket.broadcast.emit("chosen-worker", workerId);
      }

      const worker = new ObjectId(decoded._id);
      await WorkerView.updateWorkerAvailability(worker, isAvailable);

      // Track the connected worker's socket
      connectedWorkersMap.set(workerId, socket.id);
    } catch (error) {
      console.error("Error handling worker connection:", error);
    }
  });

  // Handle worker disconnection
  socket.on("disconnect", async () => {
    // Find the worker associated with this socket
    const workerEntry = Array.from(connectedWorkersMap.entries()).find(
      ([_, socketId]) => socketId === socket.id
    );

    if (workerEntry) {
      const [workerId, _] = workerEntry;
      try {
        // Update worker availability to false
        const worker = new ObjectId(workerId);
        await WorkerView.updateWorkerAvailability(worker, false);
        socket.broadcast.emit("chosen-worker", workerId);

        // Remove the worker from the connected workers map
        connectedWorkersMap.delete(workerId);

        console.log("Worker disconnected and set to unavailable:", workerId);
      } catch (error) {
        console.error(
          "Error updating worker availability on disconnect:",
          error
        );
      }
    }
  });
});

module.exports = server;
