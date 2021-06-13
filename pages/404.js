// pages/404.js
import Error from "next/error";
import { Component } from "react";

class Custom404 extends Component {
  render() {
    return <Error statusCode={404}></Error>;
  }
}

export default Custom404;
