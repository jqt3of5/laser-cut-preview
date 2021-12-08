import {Material, MaterialCategory, Project, GraphicGroup} from "./common/data";
import {DimensionUnits} from "./common/Dimension";

export interface AppState {
    fileToUpload: File | null,
    materials: MaterialCategory[]
    project: Project,
    unit : DimensionUnits,
    isUploadingNewGraphic: boolean,
    isSubmittingOrder: boolean
}
export enum ActionType {
    UpdateProject = 'update-project',
    UpdateMaterials = 'update-materials',
    SelectMaterial = 'select-material',
    StartAddingNewGraphic = 'add-new-graphic',
    GraphicChanged = 'graphic-changed',
    GraphicAddFinished = 'graphic-added',
    GraphicDeleted = 'graphic-deleted',
    SetUnits = 'set-project-units'
}

export type AppAction =
    | {type: ActionType.UpdateProject, project: Project}
    | {type: ActionType.UpdateMaterials, materials: MaterialCategory[]}
    | {type: ActionType.SelectMaterial, material: Material}
    | {type: ActionType.GraphicChanged, graphic: GraphicGroup}
    | {type: ActionType.GraphicAddFinished, graphic: GraphicGroup | null}
    | {type: ActionType.GraphicDeleted, graphic: GraphicGroup}
    | {type: ActionType.StartAddingNewGraphic}
    | {type: ActionType.SetUnits, unit: DimensionUnits}
