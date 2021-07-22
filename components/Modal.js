import styles from "../styles/Home.module.css";

const { Component } = require("react");

class Modal extends Component {
  state = { show: true };

  constructor(props) {
    super(props);

    let time = props.time || 5 * 1000; // Defaults to 5s
    setTimeout(() => {
      this.setState({ show: false });
    }, time);
  }

  render() {
    if (this.state.show === false) return <></>;
    return (
      <>
        <div
          className={styles.code}
          style={{
            position: "fixed",
            bottom: "100px",
            left: "50%",
            transform: "translate(-50%, 0)",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "5px",
              top: "0px",
              cursor: "pointer",
              color: "grey",
            }}
            onClick={() =>
              this.setState({
                show: false,
              })
            }
          >
            ×
          </div>
          <div style={{ height: "5px" }} />
          {this.props.children}
        </div>
      </>
    );
  }
}

export default Modal;
