import { Config } from "../shared/config"
import { HandlingAttribute, VehicleHandlingData } from "../shared/types"
import { getExport, QBCoreExport } from "../utils/getExport"

const QBCore = getExport<QBCoreExport>("qb-core").GetCoreObject()

function hasPermission(src: number): boolean {
  if (src === 0) return true // Server Console

  // 1. Allow QBCore Admins / God
  const isAdmin =
    QBCore.Functions.HasPermission(src, "admin") ||
    QBCore.Functions.HasPermission(src, "god")
  if (isAdmin) return true

  // 2. Allow Configured Jobs (mechanic, police, etc.)
  const Player = QBCore.Functions.GetPlayer(src)
  if (!Player?.PlayerData?.job) return false

  return Config.allowedJobs.includes(Player.PlayerData.job.name)
}

/**
 * Helper to safely execute oxmysql queries across various oxmysql versions and startup timing conditions.
 */
async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const ox = (globalThis as any).exports?.oxmysql
  if (!ox) return null

  if (typeof ox.query === "function") {
    try {
      const res = await ox.query(query, params)
      if (res !== undefined && res !== null) return res
    } catch (_) {}
  }

  if (typeof ox.query_async === "function") {
    try {
      const res = await ox.query_async(query, params)
      if (res !== undefined && res !== null) return res
    } catch (_) {}
  }

  if (typeof ox.fetch_all === "function") {
    try {
      const res = await ox.fetch_all(query, params)
      if (res !== undefined && res !== null) return res
    } catch (_) {}
  }

  return null
}

async function migrateDatabaseTable(retries = 5): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS \`vehicle_model_handling\` (
          \`model\` VARCHAR(50) NOT NULL PRIMARY KEY
        )
      `)

      // 1. Try querying INFORMATION_SCHEMA
      const infoSchemaQuery = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vehicle_model_handling' 
          AND TABLE_SCHEMA = DATABASE()
      `

      let columns = await executeQuery(infoSchemaQuery, [])

      // 2. Fallback to SHOW COLUMNS if INFORMATION_SCHEMA didn't return rows
      if (!columns || (Array.isArray(columns) && columns.length === 0)) {
        columns = await executeQuery(
          "SHOW COLUMNS FROM `vehicle_model_handling`",
          [],
        )
      }

      if (columns) {
        const columnList: any[] = Array.isArray(columns)
          ? columns
          : Object.values(columns)
        const existingColumns = new Set(
          columnList.map((col: any) =>
            (
              col.COLUMN_NAME ||
              col.column_name ||
              col.Field ||
              col.field ||
              ""
            ).toString(),
          ),
        )

        const columnDefinitions: Record<string, string> = {
          fMass: "FLOAT",
          fInitialDragCoeff: "FLOAT",
          fDownforceModifier: "FLOAT",
          fPercentSubmerged: "FLOAT",
          vecCentreOfMassOffset_x: "FLOAT",
          vecCentreOfMassOffset_y: "FLOAT",
          vecCentreOfMassOffset_z: "FLOAT",
          vecInertiaMultiplier_x: "FLOAT",
          vecInertiaMultiplier_y: "FLOAT",
          vecInertiaMultiplier_z: "FLOAT",
          fDriveBiasFront: "FLOAT",
          nInitialDriveGears: "INT",
          fInitialDriveForce: "FLOAT",
          fDriveInertia: "FLOAT",
          fClutchChangeRateScaleUpShift: "FLOAT",
          fClutchChangeRateScaleDownShift: "FLOAT",
          fInitialDriveMaxFlatVel: "FLOAT",
          fBrakeForce: "FLOAT",
          fBrakeBiasFront: "FLOAT",
          fHandBrakeForce: "FLOAT",
          fSteeringLock: "FLOAT",
          fTractionCurveMax: "FLOAT",
          fTractionCurveMin: "FLOAT",
          fTractionCurveLateral: "FLOAT",
          fTractionSpringDeltaMax: "FLOAT",
          fLowSpeedTractionLossMult: "FLOAT",
          fCamberStiffnesss: "FLOAT",
          fTractionBiasFront: "FLOAT",
          fTractionLossMult: "FLOAT",
          fSuspensionForce: "FLOAT",
          fSuspensionCompDamp: "FLOAT",
          fSuspensionReboundDamp: "FLOAT",
          fSuspensionUpperLimit: "FLOAT",
          fSuspensionLowerLimit: "FLOAT",
          fSuspensionRaise: "FLOAT",
          fSuspensionBiasFront: "FLOAT",
          fAntiRollBarForce: "FLOAT",
          fAntiRollBarBiasFront: "FLOAT",
          fRollCentreHeightFront: "FLOAT",
          fRollCentreHeightRear: "FLOAT",
          fCollisionDamageMult: "FLOAT",
          fWeaponDamageMult: "FLOAT",
          fDeformationDamageMult: "FLOAT",
          fEngineDamageMult: "FLOAT",
          fPetrolTankVolume: "FLOAT",
          fPetrolConsumptionRate: "FLOAT",
          fOilVolume: "FLOAT",
          fSeatOffsetDistX: "FLOAT",
          fSeatOffsetDistY: "FLOAT",
          fSeatOffsetDistZ: "FLOAT",
          nMonetaryValue: "INT",
          strModelFlags: "INT UNSIGNED",
          strHandlingFlags: "INT UNSIGNED",
          strDamageFlags: "INT UNSIGNED",
          fBackEndPopUpCarImpulseMult: "FLOAT",
          fBackEndPopUpBuildingImpulseMult: "FLOAT",
          fBackEndPopUpMaxDeltaSpeed: "FLOAT",
          fToeFront: "FLOAT",
          fToeRear: "FLOAT",
          fCamberFront: "FLOAT",
          fCamberRear: "FLOAT",
          fCastor: "FLOAT",
          fMaxDriveBiasTransfer: "FLOAT",
          fJumpForceScale: "FLOAT",
          fIncreasedRammingForceScale: "FLOAT",
          strAdvancedFlags: "INT UNSIGNED",
        }

        let addedCount = 0
        for (const [colName, colType] of Object.entries(columnDefinitions)) {
          if (!existingColumns.has(colName)) {
            await executeQuery(
              `ALTER TABLE \`vehicle_model_handling\` ADD COLUMN \`${colName}\` ${colType}`,
            )
            addedCount++
          }
        }

        if (addedCount > 0) {
          console.log(
            `[qb-vehicle-handling-editor] Successfully added ${addedCount} handling columns to vehicle_model_handling table.`,
          )
        }
        return // Success! Exit loop
      }
    } catch (error) {
      console.error(
        `[qb-vehicle-handling-editor] Attempt ${attempt} error migrating table:`,
        error,
      )
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  console.error(
    `[qb-vehicle-handling-editor] Could not retrieve table columns after ${retries} attempts. Ensure oxmysql is running and connected.`,
  )
}

on("onResourceStart", (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return
  migrateDatabaseTable()
})

// Aplicar un atributo individual a un vehículo (Broadcast a todos los clientes)
onNet(
  "vehiclehandling:setAttribute",
  (netId: number, attribute: HandlingAttribute, value: number) => {
    const src = source

    if (!hasPermission(src)) {
      TriggerClientEvent(
        "QBCore:Notify",
        src,
        "You do not have permission to use the handling editor.",
        "error",
      )
      return
    }

    // Validar si el atributo enviado está en la lista permitida
    const isValid = Config.validAttributes.includes(attribute)
    if (
      !isValid ||
      typeof value !== "number" ||
      isNaN(value) ||
      !isFinite(value)
    ) {
      TriggerClientEvent(
        "QBCore:Notify",
        src,
        "Invalid attribute or value.",
        "error",
      )
      return
    }

    // Transmitir a todos los clientes (-1) para sincronizar la física del vehículo en red
    TriggerClientEvent(
      "vehiclehandling:applyAttribute",
      -1,
      netId,
      attribute,
      value,
    )
  },
)

// Obtener la configuración guardada en BD para un modelo (Abierto a todos los conductores)
onNet("vehiclehandling:fetchModelTuning", async (modelName: string) => {
  const src = source
  if (!modelName || typeof modelName !== "string") return

  const query =
    "SELECT * FROM `vehicle_model_handling` WHERE `model` = ? LIMIT 1"
  try {
    const rawResult = await executeQuery(query, [modelName])
    let result: VehicleHandlingData | null = null

    if (Array.isArray(rawResult) && rawResult.length > 0) {
      result = rawResult[0] as VehicleHandlingData
    } else if (
      rawResult &&
      !Array.isArray(rawResult) &&
      typeof rawResult === "object"
    ) {
      result = rawResult as VehicleHandlingData
    }

    TriggerClientEvent(
      "vehiclehandling:loadModelTuning",
      src,
      modelName,
      result,
    )
  } catch (err) {
    console.error(
      `[qb-vehicle-handling-editor] Error fetching tuning for model ${modelName}:`,
      err,
    )
  }
})

// Guardar o actualizar la configuración de un modelo en BD
onNet(
  "vehiclehandling:saveModelTuning",
  async (modelName: string, data: VehicleHandlingData) => {
    const src = source

    if (!hasPermission(src)) {
      TriggerClientEvent(
        "QBCore:Notify",
        src,
        "You do not have permission to save handling tuning.",
        "error",
      )
      return
    }

    if (!modelName || typeof modelName !== "string" || !data) {
      TriggerClientEvent("QBCore:Notify", src, "Invalid tuning data.", "error")
      return
    }

    const columns: string[] = ["`model`"]
    const valuePlaceholders: string[] = ["?"]
    const updateClauses: string[] = []
    const params: any[] = [modelName]

    // Construir consulta dinámicamente según atributos presentes en el objeto 'data'
    for (const attr of Config.validAttributes) {
      const val = data[attr]
      if (val !== undefined && val !== null) {
        const numVal = Number(val)
        if (!isNaN(numVal) && isFinite(numVal)) {
          columns.push(`\`${attr}\``)
          valuePlaceholders.push("?")
          updateClauses.push(`\`${attr}\` = VALUES(\`${attr}\`)`)
          params.push(numVal)
        }
      }
    }

    if (columns.length === 1) {
      TriggerClientEvent(
        "QBCore:Notify",
        src,
        "No valid attributes provided to save.",
        "error",
      )
      return
    }

    const query = `
    INSERT INTO \`vehicle_model_handling\` (${columns.join(", ")})
    VALUES (${valuePlaceholders.join(", ")})
    ON DUPLICATE KEY UPDATE ${updateClauses.join(", ")}
  `

    try {
      await executeQuery(query, params)
      TriggerClientEvent(
        "QBCore:Notify",
        src,
        "Model handling profile saved successfully!",
        "success",
      )
      // Transmitir a todos los conductores activos para recargar el vehículo
      TriggerClientEvent("vehiclehandling:refreshModelDrivers", -1, modelName)
    } catch (err) {
      console.error(
        `[qb-vehicle-handling-editor] Error saving tuning for model ${modelName}:`,
        err,
      )
      TriggerClientEvent(
        "QBCore:Notify",
        src,
        "Error saving handling profile.",
        "error",
      )
    }
  },
)

// Resetear la configuración a valores de fábrica
onNet("vehiclehandling:deleteModelTuning", async (modelName: string) => {
  const src = source

  if (!hasPermission(src)) {
    TriggerClientEvent(
      "QBCore:Notify",
      src,
      "You do not have permission to reset handling profiles.",
      "error",
    )
    return
  }

  if (!modelName || typeof modelName !== "string") return

  const query = "DELETE FROM `vehicle_model_handling` WHERE `model` = ?"
  try {
    await executeQuery(query, [modelName])
    TriggerClientEvent(
      "QBCore:Notify",
      src,
      "Model handling profile reset to default.",
      "success",
    )
    TriggerClientEvent("vehiclehandling:refreshModelDrivers", -1, modelName)
  } catch (err) {
    console.error(
      `[qb-vehicle-handling-editor] Error deleting tuning for model ${modelName}:`,
      err,
    )
  }
})

// Registrar comandos QBCore
QBCore.Commands.Add(
  "tunehandling",
  "Open vehicle handling editor",
  [],
  false,
  (source: number) => {
    if (!hasPermission(source)) {
      TriggerClientEvent(
        "QBCore:Notify",
        source,
        "You do not have an authorized job to use this command.",
        "error",
      )
      return
    }
    TriggerClientEvent("vehiclehandling:client:openEditor", source)
  },
  "user",
)
