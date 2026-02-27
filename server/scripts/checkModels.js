import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // The current SDK might not have listModels easily accessible in this version
        // but we can try to find valid models by testing them or using the REST API
        console.log("Checking model availability for your API key...");

        const testModels = [
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-pro"
        ];

        for (const modelName of testModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                // Just try to see if the model object can be created and ideally if a dummy request works
                // But even just creation doesn't hit the network. We need a request.
                await model.generateContent("hi");
                console.log(`✅ ${modelName} is AVAILABLE`);
            } catch (e) {
                console.log(`❌ ${modelName} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
