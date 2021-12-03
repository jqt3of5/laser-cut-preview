import {Material, MaterialCategory, Project, SvgGraphic} from "./common/data";

export interface AppState {
    fileToUpload: File | null,
    materials: MaterialCategory[]
    project: Project,
}
export enum ActionType {
    UpdateProject = 'update-project',
    UpdateMaterials = 'update-materials',
    SelectMaterial = 'select-material',
    FileSelected = 'file-selected',
    GraphicChanged = 'graphic-changed',
    GraphicAdded = 'graphic-added',
    GraphicDeleted = 'graphic-deleted',
}

export type AppAction =
    | {type: ActionType.UpdateProject, project: Project}
    | {type: ActionType.UpdateMaterials, materials: MaterialCategory[]}
    | {type: ActionType.SelectMaterial, material: Material}
    | {type: ActionType.GraphicChanged, graphic: SvgGraphic}
    | {type: ActionType.GraphicAdded, graphic: SvgGraphic}
    | {type: ActionType.GraphicDeleted, graphic: SvgGraphic}
    | {type: ActionType.FileSelected, files: FileList | null}
