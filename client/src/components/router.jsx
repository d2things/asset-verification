import * as React from "react";
import { Switch, Route } from "wouter";

import Home from "../pages/home";

import Verify from "../pages/verify";
import Success from "../pages/success";

export default () => (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/success" component={Success} />
    
      <Route path="/verify/:token">
        {(params) => {
          const token = params.token;
          return <Verify token={token} />;
        }}
      </Route>
    </Switch>
);
