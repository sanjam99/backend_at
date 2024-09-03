import express from 'express';
import cors from 'cors';
import { Client } from '@gradio/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Initialize the Express app
const app = express();
app.use(cors());
app.use(express.json());

// Set up Multer for file handling
const upload = multer({ dest: 'uploads/', limits: { fileSize: 4 * 1024 * 1024 }});

app.post('/api/predict', upload.single('file'), async (req, res) => {
    try {
        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        const filePath = req.file.path;

        // Connect to the Gradio client
        const client = await Client.connect("sanket09/crop-classification-demo");

        // Make the prediction
        const result = await client.predict("/partial", {
            target_image: fs.readFileSync(filePath)
        });

        // Delete the file after prediction
        try {
            fs.unlinkSync(filePath);
        } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
        }

        // Return the result to the client
        res.json(result.data);
    } catch (error) {
        console.error("Error occurred during prediction:", error);
        res.status(500).json({ error: "Prediction failed." });
    }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
