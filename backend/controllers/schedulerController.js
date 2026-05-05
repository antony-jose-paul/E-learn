import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";
import dotenv from 'dotenv';
dotenv.config();

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSchedule = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Syllabus PDF file is required." });
        }

        const { examDate, dailyStudyHours } = req.body;

        if (!examDate || !dailyStudyHours) {
            return res.status(400).json({ message: "Exam date and daily study hours are required." });
        }

        // Parse PDF using pdf2json with a temporary file to avoid parseBuffer bugs
        const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.pdf`);
        fs.writeFileSync(tempFilePath, req.file.buffer);

        let syllabusText = "";
        try {
            const PDFParser = (await import("pdf2json")).default;
            syllabusText = await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser(null, 1); // 1 = text only
                pdfParser.on("pdfParser_dataError", errData => {
                    reject(errData.parserError);
                });
                pdfParser.on("pdfParser_dataReady", () => {
                    resolve(pdfParser.getRawTextContent());
                });
                pdfParser.loadPDF(tempFilePath);
            });
        } finally {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }

        // Ensure text is extracted
        if (!syllabusText || syllabusText.trim().length === 0) {
            return res.status(400).json({ message: "Could not extract text from the provided PDF." });
        }

        const currentDate = new Date().toISOString();
        const prompt = `
            You are an expert educational planner. I need to create a microlearning schedule based on the following syllabus text.
            The schedule must start from today (${currentDate}) and end on the exam date (${new Date(examDate).toISOString()}).
            The student can study for ${dailyStudyHours} hours per day.

            Please divide the syllabus topics into structured microlearning sessions from today until the exam date. Consider the remaining days and the daily study limit.
            Reserve the last 15% of the total days (with a minimum of 1 day) entirely for revision.

            Return the output EXCLUSIVELY as a JSON array of daily plans (no markdown formatting, no comments, just the raw JSON).
            The format must be exactly like this:
            [
                {
                    "date": "2023-11-01T00:00:00.000Z",
                    "isRevision": false,
                    "totalHours": 2,
                    "topics": [
                        { "id": "1", "name": "Topic Name", "estimatedHours": 1, "completed": false },
                        { "id": "2", "name": "Another Topic", "estimatedHours": 1, "completed": false }
                    ]
                }
            ]

            Here is the Syllabus Text:
            ${syllabusText}
        `;

        const model = genai.getGenerativeModel({
            model: 'gemini-3-flash-preview',
            systemInstruction: "You are an expert educational planner. Your output must be exactly a valid JSON array matching the requested structure, with no additional formatting or explanations.",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const result = await model.generateContent(prompt);

        let generatedText = result.response.text();

        // Extract json array explicitly in case it's wrapped in something
        const startIdx = generatedText.indexOf('[');
        const endIdx = generatedText.lastIndexOf(']');
        if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
            generatedText = generatedText.substring(startIdx, endIdx + 1);
        }

        let schedule;
        try {
            schedule = JSON.parse(generatedText);
        } catch (parseError) {
            console.error("Failed to parse Gemini output as JSON.");
            console.error("Parse Error Details:", parseError.message);
            fs.writeFileSync(path.join(os.tmpdir(), "gemini_error_output.txt"), generatedText);
            console.error("Saved raw output to /tmp/gemini_error_output.txt");
            return res.status(500).json({ message: "AI returned invalid format. Please try again." });
        }

        res.status(200).json(schedule);

    } catch (error) {
        console.error("Error generating schedule:", error);
        res.status(500).json({ message: "Failed to generate schedule. Please try again." });
    }
};
