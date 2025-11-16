import connectDB from "./database/database.js";
import app from "./app.js";
import seedSuperAdmin from "./utils/seedSuperAdmin.js";
import { config } from "./config/env.js";

connectDB().then(async () => {
    try {
        await seedSuperAdmin();
    } catch (error) {
        console.error("❌ Error while creating superadmin:", error.message);
        // ⚠️ Option 1: Continue running server anyway
        // ⚠️ Option 2: process.exit(1); // If you want to fail hard
    }

    app.listen(config.port || 8000, config.server.host, async () => {
        console.log(`Server is running at on : http://${config.server.host}:${config.port}`);
    })
}).catch((err) => {
    console.log('MongoDB Failed !!!', err);
});