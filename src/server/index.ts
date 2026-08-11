import { Config } from "../shared/config";
import { HandlingAttribute, VehicleHandlingData } from '../shared/types'
import { getExport, QBCoreExport } from "../utils/getExport";

const QBCore = getExport<QBCoreExport>('qb-core').GetCoreObject()

async function migrateDatabaseTable(): Promise<void> {
    try{
        await (globalThis as any ).exports.oxmysql.query_async(`
            CREATE TABLE IF NOT EXISTS \`vehicle_model_handling\` (
            \`model\` VARCHAR(50) NOT NULL PRIMARY KEY
            )
        `)

        const columns: any[] = await (globalThis as any ).exports.oxmysql.query_async('SHOW COLUMNS FROM `vehicle_model_handling`')
        const existingColumns = new Set(columns.map((col: any) => col.Field))

        const columnDefinitions: Record<string, string> = {
            fMass: 'FLOAT',
            fInitialDragCoeff: 'FLOAT',
            fDownforceModifier: 'FLOAT',
            fPercentSubmerged: 'FLOAT',
            vecCentreOfMassOffset_x: 'FLOAT',
            vecCentreOfMassOffset_y: 'FLOAT',
            vecCentreOfMassOffset_z: 'FLOAT',
            vecInertiaMultiplier_x: 'FLOAT',
            vecInertiaMultiplier_y: 'FLOAT',
            vecInertiaMultiplier_z: 'FLOAT',
            fDriveBiasFront: 'FLOAT',
            nInitialDriveGears: 'INT',
            fInitialDriveForce: 'FLOAT',
            fDriveInertia: 'FLOAT',
            fClutchChangeRateScaleUpShift: 'FLOAT',
            fClutchChangeRateScaleDownShift: 'FLOAT',
            fInitialDriveMaxFlatVel: 'FLOAT',
            fBrakeForce: 'FLOAT',
            fBrakeBiasFront: 'FLOAT',
            fHandBrakeForce: 'FLOAT',
            fSteeringLock: 'FLOAT',
            fTractionCurveMax: 'FLOAT',
            fTractionCurveMin: 'FLOAT',
            fTractionCurveLateral: 'FLOAT',
            fTractionSpringDeltaMax: 'FLOAT',
            fLowSpeedTractionLossMult: 'FLOAT',
            fCamberStiffnesss: 'FLOAT',
            fTractionBiasFront: 'FLOAT',
            fTractionLossMult: 'FLOAT',
            fSuspensionForce: 'FLOAT',
            fSuspensionCompDamp: 'FLOAT',
            fSuspensionReboundDamp: 'FLOAT',
            fSuspensionUpperLimit: 'FLOAT',
            fSuspensionLowerLimit: 'FLOAT',
            fSuspensionRaise: 'FLOAT',
            fSuspensionBiasFront: 'FLOAT',
            fAntiRollBarForce: 'FLOAT',
            fAntiRollBarBiasFront: 'FLOAT',
            fRollCentreHeightFront: 'FLOAT',
            fRollCentreHeightRear: 'FLOAT',
            fCollisionDamageMult: 'FLOAT',
            fWeaponDamageMult: 'FLOAT',
            fDeformationDamageMult: 'FLOAT',
            fEngineDamageMult: 'FLOAT',
            fPetrolTankVolume: 'FLOAT',
            fPetrolConsumptionRate: 'FLOAT',
            fOilVolume: 'FLOAT',
            fSeatOffsetDistX: 'FLOAT',
            fSeatOffsetDistY: 'FLOAT',
            fSeatOffsetDistZ: 'FLOAT',
            nMonetaryValue: 'INT',
            strModelFlags: 'INT UNSIGNED',
            strHandlingFlags: 'INT UNSIGNED',
            strDamageFlags: 'INT UNSIGNED',
            fBackEndPopUpCarImpulseMult: 'FLOAT',
            fBackEndPopUpBuildingImpulseMult: 'FLOAT',
            fBackEndPopUpMaxDeltaSpeed: 'FLOAT',
            fToeFront: 'FLOAT',
            fToeRear: 'FLOAT',
            fCamberFront: 'FLOAT',
            fCamberRear: 'FLOAT',
            fCastor: 'FLOAT',
            fMaxDriveBiasTransfer: 'FLOAT',
            fJumpForceScale: 'FLOAT',
            fIncreasedRammingForceScale: 'FLOAT',
            strAdvancedFlags: 'INT UNSIGNED'
        };

        for (const [colName, colType] of Object.entries(columnDefinitions)){
            if(!existingColumns.has(colName)){
                await (globalThis as any).exports.oxmysql.query_async(
                    `ALTER TABLE \`vehicle_model_handling\` ADD COLUMN \`${colName}\` ${colType}`
                )
                console.log(`[qb-vehicle-handling-editor] Added column \`${colName}\` (${colType}) to vehicle_model_handling`)
            }
        }
    } catch(error){
        console.error(`[qb-vehicle-handling-editor] Error migrating database table:`, error)
    }
}

on('onResourceStart', (resourceName: string)=>{
    if(GetCurrentResourceName() !== resourceName) return
    migrateDatabaseTable()
})

// Aplicar un atributo individual a un vehículo (Broadcast a todos los clientes)
onNet('vehiclehandling:setAttribute', (netId: number, attribute: HandlingAttribute, value: number) => {
  const src = global.source;
  // Validar si el atributo enviado está en la lista permitida
  const isValid = Config.validAttributes.includes(attribute);
  if (!isValid) {
    TriggerClientEvent('QBCore:Notify', src, 'Invalid attribute.', 'error');
    return;
  }
  // Transmitir a todos los clientes (-1) para sincronizar la física del vehículo en red
  TriggerClientEvent('vehiclehandling:applyAttribute', -1, netId, attribute, value);
});
// Obtener la configuración guardada en BD para un modelo
onNet('vehiclehandling:fetchModelTuning', async (modelName: string) => {
  const src = global.source;
  const query = 'SELECT * FROM `vehicle_model_handling` WHERE `model` = ?';
  try {
    const result: any[] = await (globalThis as any).exports.oxmysql.query_async(query, [modelName]);
    if (result && result.length > 0) {
      TriggerClientEvent('vehiclehandling:loadModelTuning', src, modelName, result[0]);
    } else {
      TriggerClientEvent('vehiclehandling:loadModelTuning', src, modelName, null);
    }
  } catch (err) {
    console.error(`[qb-vehicle-handling-editor] Error fetching tuning for model ${modelName}:`, err);
  }
});
// Guardar o actualizar la configuración de un modelo en BD
onNet('vehiclehandling:saveModelTuning', async (modelName: string, data: VehicleHandlingData) => {
  const src = global.source;
  const columns: string[] = ['`model`'];
  const valuePlaceholders: string[] = ['?'];
  const updateClauses: string[] = [];
  const params: any[] = [modelName];
  // Construir consulta dinámicamente según atributos presentes en el objeto 'data'
  for (const attr of Config.validAttributes) {
    const val = data[attr];
    if (val !== undefined && val !== null) {
      columns.push(`\`${attr}\``);
      valuePlaceholders.push('?');
      updateClauses.push(`\`${attr}\` = VALUES(\`${attr}\`)`);
      params.push(Number(val));
    }
  }
  const query = `
    INSERT INTO \`vehicle_model_handling\` (${columns.join(', ')})
    VALUES (${valuePlaceholders.join(', ')})
    ON DUPLICATE KEY UPDATE ${updateClauses.join(', ')}
  `;
  try {
    await (globalThis as any).exports.oxmysql.execute_async(query, params);
    TriggerClientEvent('QBCore:Notify', src, 'Model handling profile saved successfully!', 'success');
    // Transmitir a todos los conductores activos para recargar el vehículo
    TriggerClientEvent('vehiclehandling:refreshModelDrivers', -1, modelName);
  } catch (err) {
    console.error(`[qb-vehicle-handling-editor] Error saving tuning for model ${modelName}:`, err);
    TriggerClientEvent('QBCore:Notify', src, 'Error saving handling profile.', 'error');
  }
});
// Resetear la configuración a valores de fábrica
onNet('vehiclehandling:deleteModelTuning', async (modelName: string) => {
  const src = global.source;
  const query = 'DELETE FROM `vehicle_model_handling` WHERE `model` = ?';
  try {
    const affectedRows: number = await (globalThis as any).exports.oxmysql.execute_async(query, [modelName]);
    if (affectedRows > 0) {
      TriggerClientEvent('QBCore:Notify', src, 'Model handling profile reset to default.', 'success');
      TriggerClientEvent('vehiclehandling:refreshModelDrivers', -1, modelName);
    }
  } catch (err) {
    console.error(`[qb-vehicle-handling-editor] Error deleting tuning for model ${modelName}:`, err);
  }
});

// Registrar comandos QBCore
QBCore.Commands.Add('tunehandling', 'Open vehicle handling editor', [], false, (source: number) => {
  TriggerClientEvent('vehiclehandling:client:openEditor', source);
}, 'user');
QBCore.Commands.Add('sethandling', 'Set vehicle handling attribute', [
  { name: 'attribute', help: 'Handling attribute name' },
  { name: 'value', help: 'Numeric value' }
], true, (source: number, args: string[]) => {
  const attribute = args[0] as HandlingAttribute;
  const value = Number(args[1]);
  TriggerClientEvent('vehiclehandling:client:setHandling', source, attribute, value);
}, 'user');