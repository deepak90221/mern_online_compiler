import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Compiler.css";

const Compiler = () => {
  const [files, setFiles] = useState([
    { name: "main", language: "python", code: `print("Hello, World!")` }
  ]);
  const [activeFile, setActiveFile] = useState(0);
  const [testCases, setTestCases] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark-mode");

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Hello World templates
  const helloWorldTemplates = {
    python: `print("Hello, World!")`,
    java: `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    c: `#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  };

  // Handle changing the language for the active file
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    const newFiles = [...files];
    newFiles[activeFile] = { ...newFiles[activeFile], language: newLang, code: helloWorldTemplates[newLang] };
    setFiles(newFiles);
    toast.info(`Switched to ${newLang.toUpperCase()}`);
  };

  // Handle running code
  const handleRunCode = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:9001/api/compiler/run", {
        language: files[activeFile].language,
        code: files[activeFile].code,
        testCases,
      });
      setOutput(response.data.output);
      toast.success("Code executed successfully!");
    } catch (error) {
      setOutput(`Error: ${error.response?.data.error || error.message}`);
      toast.error("Code execution failed!");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === "dark-mode" ? "light-mode" : "dark-mode";
    setTheme(newTheme);
    toast.info(`Switched to ${newTheme.replace("-", " ")}`);
  };

  // Handle code changes with auto-closing brackets
  const handleCodeChange = (e) => {
    let cursorPos = e.target.selectionStart;
    let val = e.target.value;
    let lastChar = val[cursorPos - 1];

    const pairs = { "{": "}", "[": "]", "(": ")", "'": "'", '"': '"' };

    let newCode = val;
    if (pairs[lastChar]) {
      newCode = val.slice(0, cursorPos) + pairs[lastChar] + val.slice(cursorPos);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = cursorPos;
      }, 0);
    }

    const newFiles = [...files];
    newFiles[activeFile].code = newCode;
    setFiles(newFiles);
  };

  // Add a new file tab
  const addNewFile = () => {
    setFiles([...files, { name: `file${files.length + 1}`, language: "python", code: helloWorldTemplates.python }]);
    setActiveFile(files.length);
    toast.success("New file added!");
  };

  // Remove a file tab safely
  const removeFile = (index) => {
    if (files.length === 1) {
      toast.warn("Cannot delete the last file!");
      return;
    }

    const newFiles = files.filter((_, i) => i !== index);
    let newActiveFile = activeFile;

    // Adjust active file index to stay within bounds
    if (activeFile >= newFiles.length) {
      newActiveFile = newFiles.length - 1;
    }

    setFiles(newFiles);
    setActiveFile(newActiveFile);
    toast.success("File removed!");
  };

  return (
    <div className="compiler-container">
      <div className="editor-section">
        <div className="toolbar">
          <select value={files[activeFile].language} onChange={handleLanguageChange} className="language-select">
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
          </select>
          <button onClick={handleRunCode} disabled={isLoading} className="run-button">
            {isLoading ? "Running..." : "Run"}
          </button>
          <button onClick={handleThemeToggle} className="theme-toggle">
            {theme === "dark-mode" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Tabs for multiple files */}
        <div className="tabs">
          {files.map((file, index) => (
            <div key={index} className={`tab ${activeFile === index ? "active-tab" : ""}`} onClick={() => setActiveFile(index)}>
              {file.name} {files.length > 1 && <span className="close-tab" onClick={(e) => { e.stopPropagation(); removeFile(index); }}>✖</span>}
            </div>
          ))}
          <button className="add-tab" onClick={addNewFile}>+</button>
        </div>

        {/* Code Editor */}
        <textarea
          value={files[activeFile].code}
          onChange={handleCodeChange}
          className="code-editor"
          placeholder={`Enter your ${files[activeFile].language} code here...`}
        />

        <hr className="separator-line" />

        {/* Test Cases Input */}
        <textarea
          value={testCases}
          onChange={(e) => setTestCases(e.target.value)}
          className="testcase-editor"
          placeholder="Enter test case inputs here..."
          style={{ height: "150px", resize: "vertical", fontFamily: "monospace" }}
        />
      </div>

      {/* Output Section */}
      <div className="output-section">
        <div className="output-header">
          <h3>Output:</h3>
          <button onClick={() => setOutput("")} className="clear-button">Clear</button>
        </div>
        <pre className="output-content">{output}</pre>
      </div>
    </div>
  );
};

export default Compiler;
