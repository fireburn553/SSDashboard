import Button from "../components/Button";
import LocationSelectorModal from "../components/LocationSelector";

function SignUp() {
  return (
    <>
      <div className="d-flex justify-content-center align-items-center p-5">
        <div
          className="border border-black p-4 bg-light rounded"
          style={{ width: "600px" }}
        >
          <h1 className="text-center">Sign Up</h1>
          <div className="container">
            <form>
              <div className="mb-3">
                <label htmlFor="fname" className="form-label">
                  First Name
                </label>
                <input type="text" className="form-control" id="fname" />
              </div>
              <div className="mb-3">
                <label htmlFor="lname" className="form-label">
                  Last Name
                </label>
                <input type="text" className="form-control" id="lname" />
              </div>
              <div className="mb-3">
                <label htmlFor="mname" className="form-label">
                  Middle Name
                </label>
                <input type="text" className="form-control" id="mname" />
              </div>
              <div className="mb-3">
                <label htmlFor="bdate" className="form-label">
                  Birthdate
                </label>
                <input type="date" className="form-control" id="bdate" />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Complete Address
                </label>
                <input type="text" className="form-control" id="address" />
              </div>
              <div className="mb-3"></div>
              <LocationSelectorModal />
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  aria-describedby="emailHelp"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input type="password" className="form-control" id="password" />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Confirm Password
                </label>
                <input type="password" className="form-control" id="password" />
              </div>
              <div className="mb-3">
                <label htmlFor="authority-number" className="form-label">
                  Authority Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="authority-number"
                />
              </div>
              <Button
                color="primary"
                onClick={() => alert("Sign Up clicked")}
                size={100}
              >
                Sign Up
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;
