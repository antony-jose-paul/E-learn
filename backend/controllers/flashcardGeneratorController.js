import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";
import FlashcardDeck from "../models/FlashcardDeck.js";
import Flashcard from "../models/Flashcard.js";
import Note from "../models/Note.js";
import dotenv from 'dotenv';
dotenv.config();

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractTextFromPDF = async (pdfPath) => {
    const PDFParser = (await import("pdf2json")).default;
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1); // 1 = text only
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
        pdfParser.loadPDF(pdfPath);
    });
};

export const generateFlashcardsCore = async (noteId) => {
    const note = await Note.findByPk(noteId);
    if (!note) throw new Error("Note not found");

    const absolutePdfPath = path.resolve(note.url);
    if (!fs.existsSync(absolutePdfPath)) throw new Error("Note PDF file not found on server.");

    const noteText = await extractTextFromPDF(absolutePdfPath);
    if (!noteText || noteText.trim().length === 0) throw new Error("Could not extract text from the note PDF.");

    // console.log(noteText);
    
    const model = genai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: "You are an expert educator. Your output must be exactly a valid JSON object matching the requested structure.",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    // Limit total text to avoid extremely long processing times and token limits
    // 40,000 characters is roughly 10,000 tokens, well within free tier limits for a single request
    const MAX_TEXT_LENGTH = 40000; 
    const textToProcess = noteText.substring(0, MAX_TEXT_LENGTH);
    
    const prompt = `
        You are an expert educator. The following text is the beginning of an educational document, which likely contains a Table of Contents or Index.
        
        First, scan the text to identify the Table of Contents/Index and extract the main topics, chapters, and themes listed.
        Then, using your own extensive knowledge about these topics, generate a comprehensive set of flashcards that cover the entire scope of the document's subject matter.
        
        Each flashcard should have a question, an answer, a difficulty level (easy, medium, or hard), and a category.
        
        Return the output EXCLUSIVELY as a JSON object with a single "flashcards" key containing an array of flashcard objects.
        
        Format:
        {
            "flashcards": [
                { "question": "...", "answer": "...", "difficulty": "easy", "category": "..." },
                ...
            ]
        }

        Content:
        ${textToProcess}
    `;

    const result = await model.generateContent(prompt);
    let generatedText = result.response.text();

    const startIdx = generatedText.indexOf('{');
    const endIdx = generatedText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
        generatedText = generatedText.substring(startIdx, endIdx + 1);
    }

    const { flashcards } = JSON.parse(generatedText);

    if (!flashcards || flashcards.length === 0) {
        throw new Error("Failed to generate any flashcards.");
    }

    const deck = await FlashcardDeck.create({
        name: `${note.title} (Auto-generated)`,
        description: `Flashcards automatically generated from note: ${note.title}`,
        category: note.subject
    });

    const flashcardData = flashcards.map(card => ({
        deck_id: deck.deck_id,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || 'medium',
        category: card.category || note.subject
    }));

    await Flashcard.bulkCreate(flashcardData);
    return { deckId: deck.deck_id, count: flashcardData.length };
};

export const generateFlashcardsFromNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const result = await generateFlashcardsCore(noteId);
        res.status(201).json({ 
            message: "Flashcards generated successfully", 
            ...result
        });
    } catch (error) {
        console.error("Error generating flashcards:", error);
        res.status(500).json({ message: "Failed to generate flashcards. " + (error.message || "") });
    }
};
