import React from 'react';
import {
    Route,
    BrowserRouter as Router,
    Switch
} from "react-router-dom";
import Editor from "./Components/Editor/Editor";
import Login from "./Components/Auth/Login";



const App = () => {
    return (
      <>
        <Router>
            <Switch>

                <Route
                    exact
                    path="/"
                >
                    <Editor />
                </Route>

                <Route
                    path="/login"
                    >
                    <Login/>
                </Route>


        </Switch>
        </Router>
      </>
  );
};

export default App;
