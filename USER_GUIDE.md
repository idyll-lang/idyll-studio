

This project is a work in progress. Use at risk of frustration.

How do you...

*...start it?* [Install the dependencies](./CONTRIBUTING.md) and run `yarn start` (or `npm start`).

*...make a new project?* At this point you can't. You have to use the command line [idyll](https://github.com/idyll-lang/idyll) tool to generate one, and then load it via this project.

*...load a project?* Hit the "select" button on the loading page. Navigate to an idyll project, and select the `index.idyll` file.

*...save a project?* `File->Save` in the top-level menu.

*...add a component?* Navigate to the `Component` panel. Drag and drop a component onto the article. A black rectangle will appear when it is in a valid location. [<span color="red">Not all components function in thir default configuration currently.</span>]

*...modify a component's property?* Click the component's properties button. Click the property. Use the text input field to change the property. [<span color="red">Bug in the current release.</span>]

*...add a property to a component?* Use code button to modify the Idyll code representing the component direction. Edit the idyll markup. Click the code button again for the change to take effect.

*...create a variable?* Navigate to the variables tab in the sidebar. Click the "Add variable" button. Set the initial value.

*...bind a variable to a component?* Drag the variables name onto a component's properties panel.

