function Footer() {
  return (
    <footer className="p-3 text-white text-center bg-secondary">
      <div className="d-flex justify-content-between align-items-center">
        {/* Left */}
        <div>Safety Service Dashboard</div>

        {/* Center */}
        <div className="align-items-center">
          <p>Contact Us</p>
          <p className="p-0 m-0">Email: camarines.norte@redcross.org.ph</p>
          <p className="p-0 m-0">Phone: 143</p>
          <p className="p-0 m-0">
            Address: Provincial Hospital Compound, <br />
            Bagasbas Road, Daet, Camarines Norte
          </p>
        </div>

        {/* Right */}
        <div>Developer Information</div>
      </div>
    </footer>
  );
}

export default Footer;
