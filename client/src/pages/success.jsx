const Success = () => {
  return (
    <div>
      <div className="container">
        <nav>
          <img className="navLogo" src="https://assets-global.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebba7e71c58cdb21f5a_CryoDAO-icon-black.svg"></img>
          <a href="https://juicebox.money/v2/p/501" target="_blank" className="button is-fund w-button">Juicebox</a>
        </nav>
        <div className="nonUserWrapper">
          <h3>Success</h3>
          <h2>The Valid Role Has Been Added To Your Account</h2>
          <p>You can close this tab now</p>
        </div>
      </div>
      
      <style>{`
        .navLogo {
          width: 48px;
          max-width: 52px;
        }

        @font-face {
          font-family: 'ABCWhyte';
          src: url('https://uploads-ssl.webflow.com/643d6a447c6e1b4184d3ddfd/643d6d72d2826f7a4110b7f9_ABCWhyte-Medium.otf') format('woff2');
        }

        body {
          background-color: #d8d8d8;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: ABCWhyte, sans-serif;
        }
        
        h1, h2, h3, p, a {
          margin: 0;
          padding: 0;
        }

        nav {
          padding: 20px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .button {
          text-align: center;
          background-color: rgba(0, 0, 0, 0);
          background-position: 100%;
          background-repeat: no-repeat;
          background-size: auto 15px;
          padding: 0 1.75rem 0 0;
          font-size: 1.25rem;
          font-weight: 500;
          text-decoration: underline;
        }

        .button.is-fund {
          background-color: #000000;
          color: #ffffff;
          background-image: url("https://assets-global.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebbfa5ac9c8a4cc598e_CryoDAO-icon-white.svg");
          background-position: 11px;
          background-size: auto 20px;
          border-radius: .25rem;
          padding: .5rem .75rem .5rem 2.5rem;
          font-size: 1rem;
          text-decoration: none;
          transition: background-color .4s;
        }

        .nonUserWrapper {
          width: 400px;
          margin: 100px auto 0 auto;
          background-color: #000000;
          border-radius: 20px;
          color: #ffffff;
          box-sizing: border-box;
          padding: 20px;
        }

        @media (max-width: 450px) {
          .nonUserWrapper {
            width: 90% !important;
            margin: 100px auto 0 auto;
            background-color: #000000;
            border-radius: 20px;
            color: #ffffff;
            box-sizing: border-box;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default Success;