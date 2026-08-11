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
  if (attribute.startsWith('vec')) {
    try {
      const baseName = attribute.split('_')[0];
      const axis = attribute.split('_')[1] as 'x' | 'y' | 'z';
      const vec = GetVehicleHandlingVector(vehicle, 'CHandlingData', baseName);
      return vec[axisMap[axis]] ?? 0;
    } catch (e) {
      return 0;
    }
  }

  const subHandlingAttrs = [
    'fBackEndPopUpCarImpulseMult', 'fBackEndPopUpBuildingImpulseMult',
    'fBackEndPopUpMaxDeltaSpeed', 'fToeFront', 'fToeRear',
    'fCamberFront', 'fCamberRear', 'fCastor',
    'fMaxDriveBiasTransfer', 'fJumpForceScale', 'fIncreasedRammingForceScale', 'strAdvancedFlags'
  ];

  const handlingClass = subHandlingAttrs.includes(attribute) ? 'CCarHandlingData' : 'CHandlingData';

  try {
    if (attribute.startsWith('n') || attribute.startsWith('str')) {
      return GetVehicleHandlingInt(vehicle, handlingClass, attribute) ?? 0;
    }
    return GetVehicleHandlingFloat(vehicle, handlingClass, attribute) ?? 0.0;
  } catch (e) {
    return 0; // FiveM V8 throws when field is missing on non-car vehicles
  }
}

export function setVehicleHandlingAttribute(vehicle: number, attribute: HandlingAttribute, value: number): void {
  
  try {
    if (attribute.startsWith('vec')) {
      const baseName = attribute.split('_')[0];
      const axis = attribute.split('_')[1] as 'x' | 'y' | 'z';
      const currentVec = GetVehicleHandlingVector(vehicle, 'CHandlingData', baseName);
      
      if (axis === 'x') currentVec[0] = value;
      if (axis === 'y') currentVec[1] = value;
      if (axis === 'z') currentVec[2] = value;
      //@ts-ignore
      SetVehicleHandlingVector(vehicle, 'CHandlingData', baseName, currentVec);
      return;
    }

    const subHandlingAttrs = [
      'fBackEndPopUpCarImpulseMult', 'fBackEndPopUpBuildingImpulseMult',
      'fBackEndPopUpMaxDeltaSpeed', 'fToeFront', 'fToeRear',
      'fCamberFront', 'fCamberRear', 'fCastor',
      'fMaxDriveBiasTransfer', 'fJumpForceScale', 'fIncreasedRammingForceScale', 'strAdvancedFlags'
    ];

    const handlingClass = subHandlingAttrs.includes(attribute) ? 'CCarHandlingData' : 'CHandlingData';

    if (attribute.startsWith('n') || attribute.startsWith('str')) {
      SetVehicleHandlingInt(vehicle, handlingClass, attribute, Math.floor(value));
      return;
    }

    SetVehicleHandlingFloat(vehicle, handlingClass, attribute, value);
  } catch (e) {
    // Ignore errors for non-existent fields on specific vehicles
  }
}