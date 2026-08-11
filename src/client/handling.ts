import { HandlingAttribute } from "../shared/types"

const axisMap: Record<"x" | "y" | "z", number> = {
  x: 0,
  y: 1,
  z: 2,
}

/**
 * Lee el valor actual de un atributo de handling de un vehículo.
 */
export function getVehicleHandlingAttribute(
  vehicle: number,
  attribute: HandlingAttribute,
): number {
  // Comprobamos si es un attr vector
  if (attribute.startsWith("vec")) {
    try {
      const parts = attribute.split("_")
      const baseName = parts[0] as string
      const axis = parts[1] as "x" | "y" | "z"
      const vec = GetVehicleHandlingVector(vehicle, "CHandlingData", baseName)
      if (!vec) return 0
      if (typeof (vec as any)[axis] === "number") return (vec as any)[axis]
      if (Array.isArray(vec)) return vec[axisMap[axis]] ?? 0
      return (vec as any)[axisMap[axis]] ?? 0
    } catch (e) {
      return 0
    }
  }

  const subHandlingAttrs = [
    "fBackEndPopUpCarImpulseMult",
    "fBackEndPopUpBuildingImpulseMult",
    "fBackEndPopUpMaxDeltaSpeed",
    "fToeFront",
    "fToeRear",
    "fCamberFront",
    "fCamberRear",
    "fCastor",
    "fMaxDriveBiasTransfer",
    "fJumpForceScale",
    "fIncreasedRammingForceScale",
    "strAdvancedFlags",
  ]

  const handlingClass = subHandlingAttrs.includes(attribute)
    ? "CCarHandlingData"
    : "CHandlingData"

  try {
    if (attribute.startsWith("n") || attribute.startsWith("str")) {
      return GetVehicleHandlingInt(vehicle, handlingClass, attribute) ?? 0
    }
    return GetVehicleHandlingFloat(vehicle, handlingClass, attribute) ?? 0.0
  } catch (e) {
    return 0 // FiveM V8 throws when field is missing on non-car vehicles
  }
}

export function setVehicleHandlingAttribute(
  vehicle: number,
  attribute: HandlingAttribute,
  value: number,
): void {
  try {
    if (attribute.startsWith("vec")) {
      const parts = attribute.split("_")
      const baseName = parts[0] as string
      const axis = parts[1] as "x" | "y" | "z"
      const vec = GetVehicleHandlingVector(vehicle, "CHandlingData", baseName)

      let x =
        typeof (vec as any)?.x === "number"
          ? (vec as any).x
          : Array.isArray(vec)
            ? vec[0]
            : 0
      let y =
        typeof (vec as any)?.y === "number"
          ? (vec as any).y
          : Array.isArray(vec)
            ? vec[1]
            : 0
      let z =
        typeof (vec as any)?.z === "number"
          ? (vec as any).z
          : Array.isArray(vec)
            ? vec[2]
            : 0

      if (axis === "x") x = value
      if (axis === "y") y = value
      if (axis === "z") z = value

      // @ts-ignore: The fivem typings for SetVehicleHandlingVector are missing the 4th argument, but it is required.
      SetVehicleHandlingVector(vehicle, "CHandlingData", baseName, [
        x,
        y,
        z,
      ] as any)
      return
    }

    const subHandlingAttrs = [
      "fBackEndPopUpCarImpulseMult",
      "fBackEndPopUpBuildingImpulseMult",
      "fBackEndPopUpMaxDeltaSpeed",
      "fToeFront",
      "fToeRear",
      "fCamberFront",
      "fCamberRear",
      "fCastor",
      "fMaxDriveBiasTransfer",
      "fJumpForceScale",
      "fIncreasedRammingForceScale",
      "strAdvancedFlags",
    ]

    const handlingClass = subHandlingAttrs.includes(attribute)
      ? "CCarHandlingData"
      : "CHandlingData"

    if (attribute.startsWith("n") || attribute.startsWith("str")) {
      SetVehicleHandlingInt(
        vehicle,
        handlingClass,
        attribute,
        Math.floor(value),
      )
      return
    }

    SetVehicleHandlingFloat(vehicle, handlingClass, attribute, value)
  } catch (e) {
    // Ignore errors for non-existent fields on specific vehicles
  }
}
