import {useEffect, useState} from "react";
import reactLogo from "./assets/react.svg";
import {convertFileSrc, invoke} from "@tauri-apps/api/tauri";
import {getMatches} from "@tauri-apps/api/cli";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState("");
  const [metadata, setMetadata] = useState("");

  useEffect(() => {
    getMatches().then(matches => {
      console.log(matches);
      if (matches.args.file) {
        const file = matches.args.file.value;
        console.log("file", file);
        if (typeof file === "string") {
          setFile(file);
        }
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      console.log("changed file", file);
      setMetadata(await invoke("get_json", {file}));
    })()
  }, [file]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", {name}));
  }

  return (
    <div className="container">
      <p>{greetMsg}</p>
      <p>File: {file}</p>
      <p>{file && <img src={convertFileSrc(file)} />}</p>
      <p>metadata: {metadata}</p>
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <div className="row">
        <div>
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button type="button" onClick={() => greet()}>
            Greet
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
