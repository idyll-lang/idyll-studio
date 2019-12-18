
Welcome to the Idyll desktop project! 

This is meant to be a WYSIWYG-ish editor for idyll documents. This is currently very much a work in progress so keep that in mind as you are getting starterted.

To get an idea of what we are trying to create check out the mocks in the README.

## Developing

### Installation 

1. Clone this repo and install dependencies with yarn or npm.
2. Create a new idyll project somewhere on your file system using `idyll create`. 

### Running locally

Run the project using `npm start` or `yarn start`. Open the project that you created in step 5 above - use the "load project" button and select the `index.idyll` file at the root of your project directory.

### Making changes

Make your changes in a branch or fork and submit a PR. If you're making visual changes please post a screenshot or movie of the new or modified functionality as this helps with reviewing!

### Testing changes to idyll

If you need to modify the main [idyll](https://idyll-lang.org) project, do the following:

1. Clone the main Idyll project and follow the instructures there to install its dependencies.
2. Check out the branch you want or make desired changes locally.
3. Link the local idyll into this project:
   1. First run `yarn link` inside of `idyll/packages/idyll-cli`
   2. Run `yarn link idyll` in this repo


## User Guide

See [USER_GUIDE.md](./USER_GUIDE.md).
