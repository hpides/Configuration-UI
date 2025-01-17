This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
## Environment variables

Set the following environment variables to define hosts for the other components:

- **REACT_APP_PDS_HOST** Host of performance data storage, e.g. example.com:8080, defaults to *own host*/reqgen
- **REACT_APP_REQGEN_HOST** Host of request generator, e.g. example.com:8080, defaults to *own host*/pds
- **REACT_APP_MQTT_HOST** Host of mqtt broker, e.g. mqtt://example.com:1883 or ws://localhost:9001, defaults to *own host*/mosquitto

Note: if using docker, environment variables have to be overwritten during **BUILD** time. E.g. build an own Dockerfile based on the existing (or the compiled image) and set the environment variables as necessary using the ENV statement.  
The default config in this Dockerfile makes these environment variables empty, which means that the app will rely on apache reverse-proxying the other services (also configured in this Dockerfile). For this config, apache expects a correctly configured at "ws://mosquitto:9001", a performance data storage at "http://performancedatastorage:6080" and a request generator at "http://requestgenerator:8080".  
If your networking setup differs, you can use Docker links or Kubernetes services. Or you use the BP-TDGT [docker-compose.yml](https://gitlab.hpi.de/bp-tdgt/whole-system-config).
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Note on running on Kubernetes with Ingress
This app uses WebSockets to show real-time performance data. Some ingress controlers do not handle the WebSockets protocol correctly, which will lead to this feature not working properly. The included Kubernetes configuration sets the required flags for the nginx-ingress controller. Please refer to your ingress controller's manual for the appropriate configuration or uncomment and use the included NodePort service instead of ingress.
