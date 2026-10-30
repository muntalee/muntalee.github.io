import { mount } from "svelte";
import Streaming from "./Streaming.svelte";
import "./styles.css";
import "./streaming.css";

mount(Streaming, {
  target: document.getElementById("app")!,
});
