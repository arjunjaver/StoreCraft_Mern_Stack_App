import { React} from "react";
import { Link} from "react-router-dom";
import { CiSquarePlus } from "react-icons/ci";
import { IoIosMoon, IoIosSunny } from "react-icons/io";

export default function navbar(props) {
  

  return (
    <div>
      <nav
        className={`navbar navbar-expand-lg navbar-${props.mode}  bg-${props.mode}`}
      >
        <div className="container-fluid">
          <Link className="navbar-brand ms-3" to="/">
            StoreCraft
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <div className="ms-auto">
              <button className="btn  border-0 me-3">
                <Link
                  className="nav-link active"
                  aria-current="page"
                  to="/addProduct"
                >
                  <CiSquarePlus
                    size={30}
                    color={props.mode === "dark" ? "white" : "black"}
                  />
                </Link>
              </button>
            </div>

            <button
              className="mb-2 me-3"
              onClick={props.toggleMode}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
                color: props.mode === "light" ? "black" : "white",
              }}
            >
              {props.mode === "light" ? (
                <IoIosMoon size={25} />
              ) : (
                <IoIosSunny size={25} />
              )}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
