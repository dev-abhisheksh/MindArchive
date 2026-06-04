import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import "./src/workers/content.worker.js";
import "./src/workers/email.worker.js";

await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})