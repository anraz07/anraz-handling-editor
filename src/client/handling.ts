import { HandlingAttribute } from '../shared/types';

const axisMap: Record<'x' | 'y' | 'z', number> = {
  'x': 0,
  'y': 1,
  'z': 2
};

/**
 * Lee el valor actual de un atributo de handling de un vehículo.
 */
export function getVehicleHandlingAttribute(vehicle: number, attribute: HandlingAttribute): number {
  // Comprobamos si es un attr vector
  if (attribute.startsWith('vecCentreOfMassOffset_')) {
    const axis = attribute.split('_')[1] as 'x' | 'y' | 'z';
    const vec = GetVehicleHandlingVector(vehicle, 'CHandlingData', 'vecCentreOfMassOffset');
    return vec[axisMap[axis]] ?? 0;
  }

  // Atributos de sub-handling (CCarHandlingData)
  const subHandlingAttrs = [
    'fBackEndPopUpCarImpulseMult', 'fBackEndPopUpBuildingImpulseMult',
    'fBackEndPopUpMaxDeltaSpeed', 'fToeFront', 'fToeRear',
    'fCamberFront', 'fCamberRear', 'fCastor',
    'fMaxDriveBiasTransfer', 'fJumpForceScale', 'fIncreasedRammingForceScale', 'strAdvancedFlags'
  ];

  if (subHandlingAttrs.includes(attribute)) {
    return GetVehicleHandlingFloat(vehicle, 'CCarHandlingData', attribute);
  }

  // Atributos numéricos de CHandlingData por defecto
  if (attribute.startsWith('n') || attribute.startsWith('str')) {
    return GetVehicleHandlingInt(vehicle, 'CHandlingData', attribute);
  }

  return GetVehicleHandlingFloat(vehicle, 'CHandlingData', attribute);
}

export function setVehicleHandlingAttribute(vehicle: number, attribute: HandlingAttribute, value: number): void {
  
  if (attribute.startsWith('vecCentreOfMassOffset_')) {
    const axis = attribute.split('_')[1] as 'x' | 'y' | 'z';
    const currentVec = GetVehicleHandlingVector(vehicle, 'CHandlingData', 'vecCentreOfMassOffset');
    
    // Asignar el nuevo valor a la coordenada correspondiente
    if (axis === 'x') currentVec[0] = value;
    if (axis === 'y') currentVec[1] = value;
    if (axis === 'z') currentVec[2] = value;
    //@ts-ignore
    SetVehicleHandlingVector(vehicle, 'CHandlingData', 'vecCentreOfMassOffset', currentVec);
    return;
  }
  // Atributos de sub-handling (CCarHandlingData)
  const subHandlingAttrs = [
    'fBackEndPopUpCarImpulseMult', 'fBackEndPopUpBuildingImpulseMult',
    'fBackEndPopUpMaxDeltaSpeed', 'fToeFront', 'fToeRear',
    'fCamberFront', 'fCamberRear', 'fCastor',
    'fMaxDriveBiasTransfer', 'fJumpForceScale', 'fIncreasedRammingForceScale', 'strAdvancedFlags'
  ];
  if (subHandlingAttrs.includes(attribute)) {
    SetVehicleHandlingFloat(vehicle, 'CCarHandlingData', attribute, value);
    return;
  }
  // Integers / Flags
  if (attribute.startsWith('n') || attribute.startsWith('str')) {
    SetVehicleHandlingInt(vehicle, 'CHandlingData', attribute, Math.floor(value));
    return;
  }
  // Floats estándar
  SetVehicleHandlingFloat(vehicle, 'CHandlingData', attribute, value);
}