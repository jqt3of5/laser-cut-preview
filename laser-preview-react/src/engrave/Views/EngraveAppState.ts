import {Material, MaterialCategory, Project, GraphicGroup} from "../../common/dto";
import {DimensionUnits} from "../../common/Dimension";

export interface EngraveAppState {
    fileToUpload: File | null,
    materials: MaterialCategory[]
    project: Project | null,
    unit : DimensionUnits,
    isUploadingNewGraphic: boolean,
    isSubmittingOrder: boolean
}
export enum EngraveActionType {
    UpdateProject = 'update-project',
    UpdateMaterials = 'update-materials',
    SelectMaterial = 'select-material',
    StartAddingNewGraphic = 'add-new-graphic',
    GraphicChanged = 'graphic-changed',
    GraphicAddFinished = 'graphic-added',
    GraphicDeleted = 'graphic-deleted',
    SetUnits = 'set-project-units'
}

export type EngraveAppAction =
    | {type: EngraveActionType.UpdateProject, project: Project}
    | {type: EngraveActionType.UpdateMaterials, materials: MaterialCategory[]}
    | {type: EngraveActionType.SelectMaterial, material: Material}
    | {type: EngraveActionType.GraphicChanged, graphic: GraphicGroup}
    | {type: EngraveActionType.GraphicAddFinished, graphic: GraphicGroup | null}
    | {type: EngraveActionType.GraphicDeleted, graphic: GraphicGroup}
    | {type: EngraveActionType.StartAddingNewGraphic}
    | {type: EngraveActionType.SetUnits, unit: DimensionUnits}
