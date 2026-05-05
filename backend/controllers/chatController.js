import { GoogleGenerativeAI } from "@google/generative-ai";
import Chat from "../models/Chat.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.user_id;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const history = await Chat.findAll({
            where: { user_id: userId },
            order: [["created_at", "ASC"]],
        });

        const formattedHistory = history.map(chat => ([
            { role: "user", parts: [{ text: chat.message }] },
            { role: "model", parts: [{ text: chat.response }] }
        ])).flat();

        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction:
                "You are the AI assistant for E-learn platform. You are helpful, kind, and intelligent. You only answer queries related to education and the E-learn platform. If a user asks about anything else, politely decline to answer and remind them of your purpose. The E-learn platform offers courses, quizzes, and a discussion forum.",
        });

        const chatSession = model.startChat({
            history: formattedHistory
        });

        const result = await chatSession.sendMessage(message);
        const response = result.response.text();

        await Chat.create({
            user_id: userId,
            message,
            response,
        });

        res.status(200).json({ response });
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const chats = await Chat.findAll({
            where: { user_id: userId },
            order: [["created_at", "ASC"]],
        });
        res.status(200).json({ chats });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const summarizeText = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required for summarization" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: "You are an expert summarizer. Provide a concise, structured, and easy-to-read summary for the provided transcription text. Focus only on the main points.",
        });

        const result = await model.generateContent(text);
        const summary = result.response.text();

        res.status(200).json({ summary });
    } catch (error) {
        console.error("Error summarizing text with Gemini:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
