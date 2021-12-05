import {Material, MaterialCategory, Project, GraphicGroup} from "./common/data";
import {DimensionUnits} from "./common/Dimension";

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
    SetUnits = 'set-project-units'
}

export type AppAction =
    | {type: ActionType.UpdateProject, project: Project}
    | {type: ActionType.UpdateMaterials, materials: MaterialCategory[]}
    | {type: ActionType.SelectMaterial, material: Material}
    | {type: ActionType.GraphicChanged, graphic: GraphicGroup}
    | {type: ActionType.GraphicAdded, graphic: GraphicGroup}
    | {type: ActionType.GraphicDeleted, graphic: GraphicGroup}
    | {type: ActionType.FileSelected, files: FileList | null}
    | {type: ActionType.SetUnits, unit: DimensionUnits}
