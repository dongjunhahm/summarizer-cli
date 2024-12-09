#!/usr/bin/env bun
import { Command } from "commander";
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const program = new Command();

async function summarizeText(userInput) {
  try {
    console.log(`${process.env.OPENAI_API_KEY}`);
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for code summarization, giving a brief description of the code and its purpose.",
          },
          { role: "user", content: `Summarize this text: ${userInput}` },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(
      "Error calling OpenAI API:",
      error.response?.data || error.message
    );
    process.exit(1);
  }
}

program
  .version("1.0.0")
  .description(
    "CLI tool to summarize a codes function into a short description"
  )
  .argument("<input>", "The text or path to file to summarize")
  .option(
    "-o, --output <file>",
    "The output file to save the summary",
    "summary.txt"
  )
  .action(async (input, options) => {
    let userInput = input;

    if (fs.existsSync(input)) {
      userInput = fs.readFileSync(input, "utf-8");
    }

    console.log("Summarizing text..");
    const summary = await summarizeText(userInput);

    fs.writeFileSync(options.output, summary);
    console.log(`Summary saved to ${options.output}`);
  });

program.parse(process.argv);
