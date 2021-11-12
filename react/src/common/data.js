"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = exports.Graphic = exports.ColorMode = void 0;
class ColorMode {
    constructor(color, guid, url, mode) {
        this.color = color;
        this.guid = guid;
        this.url = url;
        this.mode = mode;
    }
}
exports.ColorMode = ColorMode;
class Graphic {
    constructor(guid, name, mimetype, url, colorModes, posX, posY, width, height) {
        this.guid = guid;
        this.name = name;
        this.mimetype = mimetype;
        this.url = url;
        this.colorModes = colorModes;
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
    }
}
exports.Graphic = Graphic;
class Project {
    constructor(projectId, material, graphics) {
        this.projectId = projectId;
        this.material = material;
        this.graphics = graphics;
    }
}
exports.Project = Project;
//# sourceMappingURL=data.js.map