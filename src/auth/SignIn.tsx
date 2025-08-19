import Button from "../components/Button";

function SignIn() {
  return (
    <div>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div
          className="border border-black p-4 bg-light rounded"
          style={{ width: "600px" }}
        >
          <h1 className="text-center">Sign In</h1>
          <div className="container">
            <form>
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
              <Button
                color="primary"
                onClick={() => alert("Sign In clicked")}
                size={100}
              >
                Sign In
              </Button>
              <div className="mt-3 text-center">
                <a href="/register">Don't have an account? Register</a>
              </div>
              <div className="mt-3 text-center">
                <a href="/forgot-password">Forgot Password?</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
