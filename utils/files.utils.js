const {join} = require("path");
const mkdir = require("@root/mkdirp");
const createDirectories = () => {
    let dir = join(__dirname,"../","files/photos");
    mkdir(dir, function (err) {
        if (err) { throw err; }
        console.log("directory now exists");
    });
}

module.exports = createDirectories;