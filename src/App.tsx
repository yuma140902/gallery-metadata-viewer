import {useEffect, useState} from "react";
import {convertFileSrc, invoke} from "@tauri-apps/api/tauri";
import {getMatches} from "@tauri-apps/api/cli";
import "./App.css";
import {tweet_url, TwitterImage} from "./type/twitter";
import JSONBig from "json-bigint";
import * as Scroll from 'react-scroll';
import twitterLogo from "./assets/twitter.svg";
import folderIcon from "./assets/fxemoji-filefolder.svg";
import folderOpenIcon from "./assets/fxemoji-openfilefolder.svg";
import downArrowIcon from "./assets/fxemoji-downarrow.svg";
import expandIcon from "./assets/ion-expand.svg";
import leftArrowIcon from "./assets/ion-arrow-left-b.svg";
import rightArrowIcon from "./assets/ion-arrow-right-b.svg";

function App() {
  const [file, setFile] = useState("");
  const [metadata, setMetadata] = useState<TwitterImage | undefined>(undefined);
  const [url, setUrl] = useState("https://twitter.com/");
  const [folderIconHover, setFolderIconHover] = useState(false);

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
      const metadata = JSONBig({storeAsString: true}).parse(metadata_str) as TwitterImage;
      setMetadata(metadata);
    })()
  }, [file]);

  useEffect(() => {
    if (metadata) {
      setUrl(tweet_url(metadata));
    }
  }, [metadata]);

  async function nextFile() {
    const next_file: string = await invoke("next_file", {file});
    setFile(next_file);
    Scroll.scroller.scrollTo("description", {smooth: false});
  }

  async function prevFile() {
    const prev_file: string = await invoke("prev_file", {file});
    setFile(prev_file);
    Scroll.scroller.scrollTo("description", {smooth: false});
  }

  return (
    <div className="prev-next-holder">
      <div className="prev-container">
        <a href="#" onClick={() => prevFile()}>
          <img src={leftArrowIcon} height="40pt" />
        </a>
      </div>

      <article className="tweet container">
        <div className="tweet-author">
          <div className="twitter-user-icon">
            <img src={metadata?.author.profile_image} />
          </div>
          <div className="twitter-user-identifier">
            <div className="twitter-user-nick">
              {metadata?.author.nick}
            </div>
            <div className="twitter-user-name">@{metadata?.author.name}</div>
          </div>
          <div className="twitter-icon">
            <a href={url} target="_blank">
              <img src={twitterLogo} />
            </a>
          </div>
        </div>
        <div className="tweet-body">
          <p className="tweet-description" id="description">{metadata?.content}</p>
          <a href="#" onClick={() => invoke("open_file", {file})}>
            <img src={expandIcon} height="20pt" />
          </a>
          <a href="#" onClick={() => invoke("open_parent_directory", {file})}>
            <img
              onMouseEnter={() => setFolderIconHover(true)}
              onMouseLeave={() => setFolderIconHover(false)}
              src={folderIconHover ? folderOpenIcon : folderIcon} height="20pt" />
          </a>
          <Scroll.Link to="description" smooth={true} duration={100}>
            <img src={downArrowIcon} height="20pt" />
          </Scroll.Link>
          {file && <img src={convertFileSrc(file)} className="main-image" id="main-image" />}
        </div>
        <div className="tweet-footer">
          <div className="tweet-date">
            <a href={url} target="_blank">{metadata?.date}</a>
          </div>
        </div>
      </article >

      <div className="next-container">
        <a href="#" onClick={() => nextFile()}>
          <img src={rightArrowIcon} height="40pt" />
        </a>
      </div>
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
    </div >
  );
}

export default App;
