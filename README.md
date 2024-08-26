# Button State Plugin

This is my first attempt at making a plugin for Obsidian, and using TypeScript.

The idea is to make buttons that will change color based on some conditions set by the user. One use case is to utilize these buttons to visually track whether a task has been done recently.

Could this have been accomplished with the [dataview](https://github.com/blacksmithgu/obsidian-dataview) plugin? Yes, and that's exactly what I've intially done with a separate js script and utilizing the `dv.view()` function. 

And while you can also add in customizability in that js script, it'd be nice to have user interface to do that as well! :)




<ins>**VERY MUCH NOT EVEN CLOSE TO WORKING RN**</ins>


## Code Block Format
Use the following format in order for the plugin to create buttons within a markdown file.

Each button must have:
- page
- tag
- name

#### Note: All other values will use their default if not specified.
````
```button-state
page: "" header: ""
    tag: "" name: "" action: false reverse: false uri: "" range: "" color: ""
    tag: "" name: "" action: false reverse: false uri: "" range: "" color: ""

page: "" header: ""
    tag: "" name: "" action: false reverse: false uri: "" range: "" color: ""
    tag: "" name: "" action: false reverse: false uri: "" range: "" color: ""

ranges: 
    name: "" range: []

colors:
    name: "" palette: []
```
````

#### Default values
<table>
    <tr>
        <th>Variable(s)</th>
        <th>Default Value</th>
    </tr>
    <tr>
        <td>colors and color</td>
        <td>default color palette</td>
    </tr>
    <tr>
        <td>ranges and range</td>
        <td>[0,1,3,7,14]</td>
    </tr>
    <tr>
        <td>action</td>
        <td>false</td>
    </tr>
    <tr>
        <td>reverse</td>
        <td>false</td>
    </tr>
    <tr>
        <td>header</td>
        <td>""</td>
    </tr>
    <tr>
        <td>uri</td>
        <td>""</td>
    </tr>
</table>

