import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fileExtensions = {
  python: "py",
  java: "java",
  c: "c",
  cpp: "cpp",
};

export const compileCode = (req, res) => {
  const { language, code, testCases } = req.body;

  if (!fileExtensions[language]) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  const fileName = `code.${fileExtensions[language]}`;
  const filePath = path.join(__dirname, fileName);
  const inputFilePath = path.join(__dirname, "input.txt");

  // Save code and test cases to files
  fs.writeFileSync(filePath, code);
  fs.writeFileSync(inputFilePath, testCases);

  let command;

  if (language === "python") {
    command = `python ${filePath} < ${inputFilePath}`;
  } else if (language === "java") {
    const match = code.match(/public\s+class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (!match) {
      return res.status(400).json({ error: "Java code must contain a public class with a valid name." });
    }
    const className = match[1]; // Extract class name from user code
    const javaFilePath = path.join(__dirname, `${className}.java`);

    // Rename the file to match the class name
    fs.renameSync(filePath, javaFilePath);

    // Ensure correct execution on Windows
    command = `javac ${javaFilePath} && java -cp . ${className} < ${inputFilePath}`;
  } else if (language === "c") {
    // Ensure correct execution of compiled C code on Windows
    command = `gcc ${filePath} -o code.exe && .\\code.exe < ${inputFilePath}`;
  } else if (language === "cpp") {
    // Ensure correct execution of compiled C++ code on Windows
    command = `g++ ${filePath} -o code.exe && .\\code.exe < ${inputFilePath}`;
  }

  // Execute the command with Windows-compatible shell
  exec(command, { shell: "cmd.exe" }, (error, stdout, stderr) => {
    // Cleanup files after execution
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
    if (language === "java") {
      const className = code.match(/public\s+class\s+([a-zA-Z_][a-zA-Z0-9_]*)/)[1];
      const javaFile = path.join(__dirname, `${className}.java`);
      const classFile = path.join(__dirname, `${className}.class`);
      if (fs.existsSync(javaFile)) fs.unlinkSync(javaFile);
      if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
    }
    if (fs.existsSync(path.join(__dirname, "code.exe"))) fs.unlinkSync(path.join(__dirname, "code.exe"));

    if (error) {
      return res.status(400).json({ error: stderr || error.message });
    }
    res.json({ output: stdout });
  });
};
