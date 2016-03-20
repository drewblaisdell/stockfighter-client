import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';

window.appBoot = () => {
  ReactDOM.render(<App />, document.getElementById( 'app' ) );
};

console.log("!");