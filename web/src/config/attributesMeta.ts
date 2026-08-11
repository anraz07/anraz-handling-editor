export interface HandlingAttributeMeta {
  tab: string;
  min?: number;
  max?: number;
  step?: number;
  desc: string;
  type?: 'hex';
}

export const attributesMeta: Record<string, HandlingAttributeMeta> = {
  // Engine & Drive
  fInitialDragCoeff: { tab: 'engine', min: 0.1, max: 30.0, step: 0.05, desc: 'Aerodynamic resistance multiplier' },
  fDownforceModifier: { tab: 'engine', min: 0.0, max: 100.0, step: 0.1, desc: 'Downforce grip multiplier' },
  fPercentSubmerged: { tab: 'engine', min: 10, max: 120, step: 1, desc: 'Percentage submerged in water before floating' },
  fDriveBiasFront: { tab: 'engine', min: 0.0, max: 1.0, step: 0.05, desc: 'Drive distribution (0.0 = RWD, 0.5 = AWD, 1.0 = FWD)' },
  fInitialDriveForce: { tab: 'engine', min: 0.05, max: 3.0, step: 0.01, desc: 'Power output capability of the engine' },
  fDriveInertia: { tab: 'engine', min: 0.1, max: 3.0, step: 0.05, desc: 'Resistance of engine rpm acceleration' },
  fClutchChangeRateScaleUpShift: { tab: 'engine', min: 0.5, max: 10.0, step: 0.1, desc: 'Clutch release speed during upshifts' },
  fClutchChangeRateScaleDownShift: { tab: 'engine', min: 0.5, max: 10.0, step: 0.1, desc: 'Clutch release speed during downshifts' },
  fInitialDriveMaxFlatVel: { tab: 'engine', min: 10.0, max: 600.0, step: 1.0, desc: 'Theoretical flat velocity capability in km/h' },
  nInitialDriveGears: { tab: 'engine', min: 1, max: 10, step: 1, desc: 'Number of forward transmission gears' },
  
  // Brakes & Steering
  fBrakeForce: { tab: 'brakes', min: 0.05, max: 5.0, step: 0.02, desc: 'Maximum braking force capability' },
  fBrakeBiasFront: { tab: 'brakes', min: 0.0, max: 1.0, step: 0.05, desc: 'Braking bias (0.0 = rear-only, 1.0 = front-only)' },
  fHandBrakeForce: { tab: 'brakes', min: 0.1, max: 15.0, step: 0.1, desc: 'Handbrake lock-up capability' },
  fSteeringLock: { tab: 'brakes', min: 10.0, max: 75.0, step: 0.5, desc: 'Steering turn angle limit in degrees' },
  
  // Traction & Tires
  fTractionCurveMax: { tab: 'traction', min: 0.5, max: 5.5, step: 0.01, desc: 'Maximum cornering/grip capability' },
  fTractionCurveMin: { tab: 'traction', min: 0.5, max: 5.0, step: 0.01, desc: 'Minimum grip capability during slip' },
  fTractionCurveLateral: { tab: 'traction', min: 2.0, max: 40.0, step: 0.1, desc: 'Resistance to sliding sideways' },
  fTractionSpringDeltaMax: { tab: 'traction', min: 0.01, max: 0.8, step: 0.01, desc: 'Traction spring response range' },
  fTractionBiasFront: { tab: 'traction', min: 0.0, max: 1.0, step: 0.05, desc: 'Traction bias (0.5 = balanced)' },
  fTractionLossMult: { tab: 'traction', min: 0.05, max: 3.0, step: 0.02, desc: 'Multiplier for traction loss during slides' },
  
  // Suspension & Chassis
  fMass: { tab: 'suspension', min: 100, max: 15000, step: 10, desc: 'Vehicle weight in kilograms' },
  fSuspensionForce: { tab: 'suspension', min: 0.5, max: 10.0, step: 0.05, desc: 'Stiffness of the suspension springs' },
  fSuspensionCompDamp: { tab: 'suspension', min: 0.01, max: 5.0, step: 0.02, desc: 'Dampening force when suspension compresses' },
  fSuspensionReboundDamp: { tab: 'suspension', min: 0.01, max: 6.0, step: 0.02, desc: 'Dampening force when suspension rebounds' },
  fSuspensionUpperLimit: { tab: 'suspension', min: 0.01, max: 1.0, step: 0.01, desc: 'Maximum suspension compression travel limit' },
  fSuspensionLowerLimit: { tab: 'suspension', min: -1.0, max: -0.01, step: 0.01, desc: 'Maximum suspension extension travel limit' },
  fSuspensionBiasFront: { tab: 'suspension', min: 0.0, max: 1.0, step: 0.05, desc: 'Suspension force balance (0.5 = centered)' },
  fAntiRollBarForce: { tab: 'suspension', min: 0.0, max: 10.0, step: 0.05, desc: 'Stabilizing anti-roll stiffness' },
  fAntiRollBarBiasFront: { tab: 'suspension', min: 0.0, max: 1.0, step: 0.05, desc: 'Anti-roll balance distribution' },
  fRollCentreHeightFront: { tab: 'suspension', min: -1.0, max: 1.0, step: 0.02, desc: 'Front body roll pivot height' },
  fRollCentreHeightRear: { tab: 'suspension', min: -1.0, max: 1.0, step: 0.02, desc: 'Rear body roll pivot height' },
  vecCentreOfMassOffset_x: { tab: 'suspension', min: -5.0, max: 5.0, step: 0.01, desc: 'Center of mass X offset (Left/Right)' },
  vecCentreOfMassOffset_y: { tab: 'suspension', min: -5.0, max: 5.0, step: 0.01, desc: 'Center of mass Y offset (Front/Back)' },
  vecCentreOfMassOffset_z: { tab: 'suspension', min: -5.0, max: 5.0, step: 0.01, desc: 'Center of mass Z offset (Up/Down)' },
  vecInertiaMultiplier_x: { tab: 'suspension', min: 0.1, max: 10.0, step: 0.05, desc: 'Rotational inertia resistance X (Pitch)' },
  vecInertiaMultiplier_y: { tab: 'suspension', min: 0.1, max: 10.0, step: 0.05, desc: 'Rotational inertia resistance Y (Roll)' },
  vecInertiaMultiplier_z: { tab: 'suspension', min: 0.1, max: 10.0, step: 0.05, desc: 'Rotational inertia resistance Z (Yaw)' },

  // Damage & Misc
  fCollisionDamageMult: { tab: 'damage', min: 0.0, max: 10.0, step: 0.05, desc: 'Collision body damage multiplier' },
  fDeformationDamageMult: { tab: 'damage', min: 0.0, max: 10.0, step: 0.05, desc: 'Deformation damage multiplier' },
  fEngineDamageMult: { tab: 'damage', min: 0.0, max: 10.0, step: 0.05, desc: 'Engine damage multiplier' },
  fPetrolTankVolume: { tab: 'damage', min: 0.0, max: 300.0, step: 1.0, desc: 'Fuel tank capacity in liters' },
  fOilVolume: { tab: 'damage', min: 0.0, max: 50.0, step: 0.1, desc: 'Engine oil capacity in liters' },
  fSeatOffsetDistX: { tab: 'damage', min: -3.0, max: 3.0, step: 0.01, desc: 'Seat X offset relative to chassis' },
  fSeatOffsetDistY: { tab: 'damage', min: -3.0, max: 3.0, step: 0.01, desc: 'Seat Y offset relative to chassis' },
  fSeatOffsetDistZ: { tab: 'damage', min: -3.0, max: 3.0, step: 0.01, desc: 'Seat Z offset relative to chassis' },
  nMonetaryValue: { tab: 'damage', min: 0, max: 10000000, step: 100, desc: 'Financial/sale value of the vehicle' },
  strModelFlags: { tab: 'damage', type: 'hex', desc: 'Model flags (hexadecimal)' },
  strHandlingFlags: { tab: 'damage', type: 'hex', desc: 'Handling flags (hexadecimal)' },
  strDamageFlags: { tab: 'damage', type: 'hex', desc: 'Damage flags (hexadecimal)' }
};
