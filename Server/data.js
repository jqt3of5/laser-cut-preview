var fs = require("fs");
var uuid = require("uuid");
//{projects:{guid:"", material: "", graphics:[{posX:0, posY:0, dimX:0, dimY:0, guid:"", colors:[{color:"", mode:""]] }
var documentDB = { projects: {} };
var assetDir = __dirname + "/Assets/";
var uploadDir = __dirname + "/upload/";
var materialsFile = assetDir + "materials.json";
var Repo = /** @class */ (function () {
    function Repo() {
    }
    Repo.prototype.getMaterials = function () {
        return new Promise(function (resolve, reject) {
            if (!fs.existsSync(materialsFile)) {
                reject(materialsFile + " Does not exist");
                return;
            }
            fs.open(materialsFile, 'r', function (err, fd) {
                fs.readFile(fd, function (err, buffer) {
                    var categories = JSON.parse(buffer);
                    resolve(categories);
                });
            });
        });
    };
    return Repo;
}());
module.exports = Repo;
//# sourceMappingURL=data.js.map