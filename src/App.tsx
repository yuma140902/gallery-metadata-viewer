import {useEffect, useState} from "react";
import {convertFileSrc, invoke} from "@tauri-apps/api/tauri";
import {getMatches} from "@tauri-apps/api/cli";
import "./App.css";
import {TwitterImage} from "./type/twitter";
//import reactLogo from "./assets/react.svg";

function App() {
  const [file, setFile] = useState("");
  const [metadata, setMetadata] = useState<TwitterImage | undefined>(undefined);

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
      const metadata_str: string = await invoke("get_json", {file});
      const metadata = JSON.parse(metadata_str) as TwitterImage;
      setMetadata(metadata);
    })()
  }, [file]);

  return (
    <div className="container">
      <p>File: {file}</p>
      <p>{file && <img src={convertFileSrc(file)} />}</p>
      <p>metadata: {metadata?.content}</p>

      {/*
      <div>
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="button" onClick={() => greet()}>
          Greet
        </button>
      </div>*/}
    </div>
  );
}

export default App;
