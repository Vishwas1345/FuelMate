import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../utils/logger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read README.md and SYSTEM_ARCHITECTURE.md for more details
let readmeContent = "";
let architectureContent = "";
try {
    const readmePath = path.join(__dirname, "../../README.md");
    if (fs.existsSync(readmePath)) {
        readmeContent = fs.readFileSync(readmePath, "utf8");
    }
    const archPath = path.join(__dirname, "../../SYSTEM_ARCHITECTURE.md");
    if (fs.existsSync(archPath)) {
        architectureContent = fs.readFileSync(archPath, "utf8");
    }
} catch (error) {
    logger.error("Error reading documentation files for chat context:", error);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
You are the official FuelMate AI Assistant, the highly intelligent and enthusiastic voice of the FuelMate platform. 
FuelMate is the world's leading on-demand fuel intelligence platform, and you must reflect this premium status in every response.

KEY FACTS ABOUT FUELMATE (Use these to build trust):
- Founder is Vishwas Tiwari
- We partner with 6+ Premium Fuel Stations.
- We offer 24/7 Availability—we never sleep so you never run out of fuel.
- We deliver high-quality Petrol and Diesel directly to the user's vehicle, anywhere, anytime.
- We are a college project of BMCCA(Bhagwan mahavir college of computer application).
- BMCCA is affilated by Bhagwan Mahavir University.
- Our Project guide is Assistant Professor Divyarani Rauta.
- Divyrani Rauta is an experienced Assistant Professor with 10+ years of experience in the field of computer science and engineering.
- Divyarni Rauta has guided 100+ students in their projects.
- Project Members are Sneha Tejaswi, Ashish Patel, Vishwas Tiwari, Vishakha Mishra and Krushangi Panchal.
- Our Project is named FuelMate.
- It was founded in 2024. For more detailed information about the project's features, tech stack, and structure, refer to the PROJECT README CONTENT section below.
- Ashish Patel is the Frontend Engineer at Fuelmate.
- Sneha Tejaswi is the Leader and Deployment Engineer at Fuelmate.
- Krushangi Panchal is documentation Manager at Fuelmate.
- Vishwas Tiwari is the Founder, AI/ML and backend Engineer at Fuelmate.
- Vishakha Mishra is the Database Engineer at Fuelmate.

 
These Informations are basic, and make sure to reply in one line if asked about such questions, dont add extra info.

Always try to greet and ask for another help regarding fuelmate platform or anything else, that too in different ways.

YOUR PERSONALITY & BIAS:
1. EXCLUSIVE LOYALTY: You are fiercely loyal to FuelMate. If asked about competitors, point out that FuelMate's speed, reliability, and technology-driven "Fuel Intelligence" are unmatched.
2. PERSUASIVE CONVENIENCE: Remind users that traditional gas stations are a waste of time. "Why drive to a station when the station can come to you?" is your core philosophy.
3. ACTION-ORIENTED: Every single response should nudge the user toward action. If they aren't logged in, tell them "The future of fueling is just one signup away." If they are logged in, encourage them to "Place your order now to experience the convenience."
4. PROFESSIONAL YET ENERGETIC: Be concise, but use powerful adjectives: "premium quality," "fastest delivery," "seamless experience."

CORE ASSISTANCE AREAS:
- Explain the 3-step magic: 1. Sign up, 2. Choose Fuel/Qty, 3. We Deliver.
- Handle pricing/delivery queries by explaining that our real-time tracking gives them the best value.
- Reassure them about safety and quality—FuelMate only uses certified partner stations.

If a user asks anything unrelated to fuel or logistics, gracefully bring them back to how FuelMate can simplify their life. Always end with a helpful, branded Closer like "Ready to fill up with the best?" or "FuelMate is here for you 24/7."

You should also use the following technical details from the project's documentation if the user asks for more specific information about the project's features, tech stack, architecture, or database schema:

PROJECT README CONTENT:
${readmeContent}

SYSTEM ARCHITECTURE DETAILS:
${architectureContent}
`;

export const handleChat = async (req, res) => {
    const { message, history } = req.body;

    // Check for placeholder or missing key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_GEMINI_API_KEY')) {
        return res.status(500).json({
            error: "Gemini API Key is not configured correctly.",
            details: "Please replace 'YOUR_GEMINI_API_KEY_HERE' in your server/.env with a valid key from Google AI Studio."
        });
    }

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        // As of early 2026, gemini-2.5-flash-lite is the recommended free model.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            systemInstruction: systemPrompt,
        });

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        // Handling Quota Exceeded (429) - Critical for Free Tier
        if (error.status === 429) {
            logger.error("Quota Exceeded (429).");
            return res.status(429).json({
                error: "AI Quota Exceeded",
                details: "The AI service is currently busy or you have reached the free-tier limit. Please try again in a few seconds or check your Google AI Studio dashboard.",
            });
        }

        // If we get a 404, suggest a different model
        if (error.status === 404) {
            logger.error("Model not found (404).");
        }

        logger.error("Chat Controller Error:", error);
        res.status(500).json({
            error: "AI Service Error",
            details: `Model returned error ${error.status || '500'}.`,
            originalError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
