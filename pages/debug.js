import { Component } from "react";
import { io } from "socket.io-client";
import Custom404 from "./404";

const socket = io();

class Debug extends Component {
  render() {
    if (process.env.PRODUCTION === "DEV") socket.emit("DEBUG");
    return <Custom404></Custom404>;
  }
}

export default Debug;
