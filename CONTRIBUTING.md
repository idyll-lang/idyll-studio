
Welcome to the Idyll desktop project! 

This is meant to be a WYSIWYG-ish editor for idyll documents. This is currently very much a work in progress so keep that in mind as you are getting starterted.

To get an idea of what we are trying to create check out the mocks in the README.

## Developing

### Installation 

1. Clone this repo and install dependencies with yarn or npm.
2. Clone the main Idyll project and follow the instructures there to install its dependencies.
3. Check out the [text-wrap](https://github.com/idyll-lang/idyll/pull/511) branch from idyll
4. Link the local idyll into this project:
   1. First run `yarn link` inside of `idyll/packages/idyll-cli`
   2. Run `yarn link idyll` in this repo
   
That should be all the setup you need.

### Running locally

Run the project using `npm start` or `yarn start`. 

### Making changes

Make your changes in a branch or fork and submit a PR. If you're making visual changes please post a screenshot or movie of the new or modified functionality as this helps with reviewing!

