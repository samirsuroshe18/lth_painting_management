import dotenv from "dotenv";
dotenv.config()
import connectDB from "./database/database.js";
import app from "./app.js";
import seedSuperAdmin from "./utils/seedSuperAdmin.js";

connectDB().then(async () => {
    try {
        await seedSuperAdmin();
    } catch (error) {
        console.error("❌ Error while creating superadmin:", error.message);
        // ⚠️ Option 1: Continue running server anyway
        // ⚠️ Option 2: process.exit(1); // If you want to fail hard
    }

    app.listen(process.env.PORT || 8000, process.env.SERVER_HOST, async () => {
        console.log(`Server is running at on : http://${process.env.SERVER_HOST}:${process.env.PORT}`);
    })
}).catch((err) => {
    console.log('MongoDB Failed !!!', err);
});