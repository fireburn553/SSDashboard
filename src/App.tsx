import "./App.css";
// import SignUp from "./auth/SignUp";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
// import LocationSelector from "./components/LocationSelector";

function App() {
  return (
    <>
      <Header signIn={true} />
      <LandingPage />
      <Footer />
    </>
  );
}

export default App;
