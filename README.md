# Cloud Foundry Server Side APIs, Routes and Services

This is a server side application has been developed to interact with some components of the <a href="https://docs.cloudfoundry.org/concepts/architecture/" target="_blank">Cloud foundry Architecture</a>: <a href="https://docs.cloudfoundry.org/concepts/architecture/cloud-controller.html" target="_blank">Cloud Controller</a>, <a href="https://docs.cloudfoundry.org/concepts/architecture/uaa.html" target="_blank">UAA</a> & <a href="https://docs.pivotal.io/pivotalcf/devguide/deploy-apps/streaming-logs.html" target="_blank">Metrics</a> services installed in a <a href="https://www.cloudfoundry.org/" target="_blank">Cloud Foundry</a> Instance. Cloud Foundry offers a <a href="https://github.com/cloudfoundry/cli" target="_blank">CLI</a> to manage a app life cycle in combination with the Web apps provided by the commercial Cloud Foundry platforms as <a href="https://run.pivotal.io/" target="_blank">PWS</a> or <a href="https://console.ng.bluemix.net/" target="_blank">Bluemix</a>. This Web App allows the user create the app, uploads the code and execute the typical actions (Start, Stop, Restage, Remove, Scale)
This is based on the project from https://github.com/prosociallearnEU/cf-nodejs-dashboard, but with the following changes
Changes: 

1. Remove the Angular JS UI
2. Change the Routes/API's to accept a JWT token
3. Change the dependency on the backend CF client to https://github.com/rjain15/cf-client

## Getting Started.

The application is able to run in localhost or hosted. To test in local, the steps are:

``` bash
git clone https://github.com/rjain15/cf-nodejs-server.git
npm install
nodemon 
-- or --
npm start

```

and later, using postman you can test the various API endpoints :

``` bash
http://localhost:5000/
```

### API's

**Login**
* List of Organization
* List of Spaces from the first Organization
* Memory used in the First Organization
* Organization Quota associated with the first Organization

**Space / Apps**
* Stage status
* App status
* Instances

* Add a new application to current space
* Refresh window

**Space / Apps / Add**

**App**

* *Open:* This method checks if the application is running and open in a new tab the application.
* *View:* This method shows details about the app's configuration. 
* *Upload:* This method is used to upload source code to the app.
* *Start/Stop:* This method is used to Start/Stop an app.
* *Restage:* This method is used to Restage the Droplet.
* *Remove:* This method is used to remove an application.
* *Log:* This method is used to get logs from the application.
* *Scale:* This method is used to update some parameters in the application.

**App / View**

**App / Upload**

**App / Logs**

**App / Scale**
