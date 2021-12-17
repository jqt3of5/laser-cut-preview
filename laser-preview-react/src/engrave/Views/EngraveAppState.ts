import {DrawableObject, Material, MaterialCategory, Project, SvgGraphicGroup} from "../../common/dto";
import {DimensionUnits} from "../../common/Dimension";
import {SnapTo} from "../Components/CutView";

export interface EngraveAppState {
    materials: MaterialCategory[]
    project: Project | null,
    addingGraphic : SvgGraphicGroup | null
    unit : DimensionUnits,
    snapTo: SnapTo,
    isUploadingNewGraphic: boolean,
    isSubmittingOrder: boolean
}
export enum EngraveActionType {
    UpdateProject = 'update-project',
    UpdateMaterials = 'update-materials',
    SelectMaterial = 'select-material',
    StartAddingNewGraphic = 'add-new-graphic',
    ObjectChanged = 'graphic-changed',
    GraphicAddFinished = 'graphic-added',
    TextObjectAdded = 'text-object-added',
    ObjectDeleted = 'graphic-deleted',
    SetUnits = 'set-project-units',
    StartSubmitingOrder = 'submit-order',
    OrderSubmited = 'order-submited'
}

export type EngraveAppAction =
    | {type: EngraveActionType.UpdateProject, project: Project}
    | {type: EngraveActionType.UpdateMaterials, materials: MaterialCategory[]}
    | {type: EngraveActionType.SelectMaterial, material: Material}
    | {type: EngraveActionType.ObjectChanged, oldObject : DrawableObject, object: DrawableObject}
    | {type: EngraveActionType.GraphicAddFinished, graphic: SvgGraphicGroup | null}
    | {type: EngraveActionType.TextObjectAdded}
    | {type: EngraveActionType.ObjectDeleted, object: DrawableObject}
    | {type: EngraveActionType.StartAddingNewGraphic, graphic: SvgGraphicGroup}
    | {type: EngraveActionType.SetUnits, unit: DimensionUnits}
    | {type: EngraveActionType.StartSubmitingOrder}
    | {type: EngraveActionType.OrderSubmited}
