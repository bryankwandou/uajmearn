export default function Footer() {
  return (
    <div className="st-footer-container relative right-1/2 left-1/2 z-10 col-span-5 h-fit w-screen -translate-x-1/2 rounded-t-[48px] md:w-[calc(100vw-144px)] lg:h-[477px]">
      <div className="main-container mt-[53px] flex h-fit flex-col justify-between gap-12 px-[40px] lg:mt-[56px] lg:flex-row lg:px-[72px]">
        <div className="footer-logo flex flex-col gap-6">
          <img
            src="/assets/logo-white.svg"
            alt="Universitas Atma Jaya Makassar, UKM Esports, Superteam Campus Club"
            className="h-16 w-auto md:h-20"
          />
          <p className="overlay-text !text-left">Superteam Campus Club</p>
        </div>
        <div className="footer-texts flex flex-col pb-10 text-white md:flex-row lg:text-right">
          <div className="text-col-1 flex flex-col items-start gap-4 md:items-end">
            <a
              href="https://superteam.fun/earn"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-text"
            >
              UAJM Earn
            </a>
            <a
              href="https://airtable.com/appPZ5nE1OqZiBKx7/shrjTq2Nt07UhRXQ7/tbl9632RzL9BJv4G0"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-text"
            >
              Payment Pipeline
            </a>
            <a
              href="/branding"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-text"
            >
              Brand Guidelines
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
