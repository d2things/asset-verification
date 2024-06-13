import React from "react";
import { Router } from "wouter";

// Where all of our pages come from
import PageRouter from "./components/router.jsx";

// Home function that is reflected across the site
export default function Home() {
  return (
    <Router>
      <main role="main" className="wrapper">
        <div className="content">
          <PageRouter />
        </div>
      </main>
    </Router>
  );
}
