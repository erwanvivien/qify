// pages/404.js
import Error from "next/error";
import { Component } from "react";

class Custom404 extends Component {
  render() {
    // return <Error statusCode={404}></Error>;
    return (
      <div
        style={{
          color: "#000",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Roboto, Segoe UI, Fira Sans, Avenir, Helvetica Neue, Lucida Grande, sans-serif",
          height: "100vh",
          justifyContent: "center",
          display: "flex",
          textAlign: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              display: "inline-block",
              borderRight: "1px solid rgba(0, 0, 0,.3)",
              margin: "0px 20px 0px 0px",
              padding: "10px 23px 10px 0",
              fontSize: "24px",
              fontWeight: "500",
              verticalAlign: "top",
            }}
          >
            404
          </h1>
          <div
            style={{
              display: "inline-block",
              textAlign: "left",
              lineHeight: "49px",
              height: "49px",
              verticalAlign: "middle",
            }}
          >
            <h2
              style={{
                fontSize: "14px",
                fontWeight: "normal",
                lineHeight: "inherit",
                margin: "0px",
                padding: "0px",
              }}
            >
              La page n'existe pas
            </h2>
          </div>
        </div>
      </div>
    );
  }
}

export default Custom404;
