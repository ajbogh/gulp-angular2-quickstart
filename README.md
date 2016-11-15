This project is a simple Angular 2 bootstrap. It includes the components to create an Angular 2 website using Gulp and NPM.
Of course Angular can be simplified without the use of Gulp, but in order to create professional, high quality websites, we want to 
include the tools of the trade. Some people might prefer another build tool instead of Gulp, so if you want to use something else you're
free to fork the project and convert it to something else.

##  Project Intent

The intent of this project is to be a simple way to spin up a new Angular website. It takes care of a vast majority of the compilation and 
setup, allowing you to focus on the frontend code instead of worrying about things like minification and concatination.

## Deendencies

- NPM - NPM will install everything you need to run this app
 
## Structure

- gulpfile.js - The task runner
- app - Folder which contains all files you will add or edit
    - assets - Where the js, stylesheets, and images will go.
        - js - Where the js goes
            - components - Where the Angular components will go.
            - modules - Where the Angular modules will go.
            - main.js - The main Angular file.
        - stylesheets - LESS stylesheets.
    - index.html - The main HTML file for the site.
- build - A folder created automatically by a gulp task. Contains the website that is used to display in the browser. Do not edit files here.
- dist - A folder created automatically by a gulp task. Contains the files which can be deployed to a production environment.


## Commands

### Running the App

In your terminal, run this command:

```bash
npm run app
```

### Testing

```bash
npm run test
```

### Build production version

```bash
npm run deploy
```

### Versioning

```bash
npm run patch # bumps the package.json version and creates a new tag in git
npm run feature #same as gulp minor
npm run minor # creates a minor update
npm run major # creates a major version, such as when a breaking change occurs
```